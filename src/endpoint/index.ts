import { OperationApiConfig } from '@directus/extensions';
import { log } from 'directus:api';
import { md } from '../utils/md';
import { Attachment, MailMessage, Options, StreamAttachment } from '../utils/_types';

const config: OperationApiConfig<Options> = {
  id: "emailer",
  handler: (router, { services, env }) => {
    const { AssetsService, MailService } = services;

    (globalThis as any).Emailer = {
      sendEmail: async (context: any) => {
        const mailService = new MailService({
          accountability: context.accountability,
          schema: context.schema,
        });

        const assetsService = new AssetsService({
          accountability: context.accountability,
          schema: context.schema,
        });

        const { body: emailPayload } = context;

        const authorityCheck = () => {
          if (env.EMAIL_ALLOW_GUEST_SEND === 'true' || env.EMAIL_ALLOW_GUEST_SEND === true) {
            return true;
          }

          if (context.accountability && context.accountability.admin === true) {
            return true;
          }

          if (context.accountability && context.accountability.roles && env.EMAIL_ALLOWED_ROLES) {
            const allowedRoles = env.EMAIL_ALLOWED_ROLES.split(',');
            if (allowedRoles.some(role => context.accountability.roles.includes(role))) {
              return true;
            }
          }
          
          return false;
        };

        const getAttachments = async (fileIDS) => {
          let attachmentsArray = [];

          if (!fileIDS || fileIDS.length === 0) {
            return attachmentsArray;
          }

          const streamAttachments = await Promise.allSettled(
            fileIDS.map(function (id) {
              return assetsService.getAsset(id, { transformationParams: {} });
            })
          );

          const resolvedAttachments = streamAttachments.filter(
            (attachment) => attachment.status === "fulfilled"
          );

          resolvedAttachments.forEach((asset) => {
            if (asset.status === "fulfilled") {
              const { stream, file } = asset.value;
              attachmentsArray.push({
                contentType: file.type,
                filename: file.filename_download,
                content: stream,
              });
            }
          });
          return attachmentsArray;
        };

        const createEmailObject = async (payload) => {
          const mail: MailMessage = {
            to: payload.to,
            subject: payload.subject,
            attachments: payload.attachments || [],
          };

          if (payload.from) mail.from = payload.from;
          if (payload.cc) mail.cc = payload.cc;
          if (payload.bcc) mail.bcc = payload.bcc;
          if (payload.replyTo) mail.replyTo = payload.replyTo;

          const safeBody = typeof payload.body !== 'string' ? JSON.stringify(payload.body) : payload.body;

          if (payload.type === 'template') {
            mail.template = {
              name: payload.template || 'base',
              data: payload.data || {},
            };
          } else {
            mail.html = payload.type === 'wysiwyg' ? safeBody : md(safeBody);
          }

          mail.attachments = payload.attachments;

          // Reset attachments field
          if (mail.attachments == null) {
            mail.attachments = new Array();
          }

          if (payload.files != null && payload.files.length > 0) {
            const fileAttachments = await getAttachments(payload.files);
            mail.attachments = mail.attachments.concat(fileAttachments);
          }

          return mail;
        };

        const send = (email): Promise<string> => {
          return new Promise(async (resolve, reject) => {
            if (authorityCheck()) {
              try {
                await mailService.send(email);
                resolve("sent");
              } catch (error) {
                console.error("MailService send error:", error);
                reject(error);
              }
            } else {
              reject(new Error("User not authorized, enable guest sending or include a token"));
            }
          });
        };

        const emailObject = await createEmailObject(emailPayload);
        return send(emailObject);
      },
    };

    router.post("/", async (req, res) => {
      const accountability = req.accountability || { user: null, role: null };
      const context = {
        accountability,
        schema: req.schema,
        body: req.body,
      };
      try {
        const result = await (globalThis as any).Emailer.sendEmail(context);
        return res.send({ message: "Email processed successfully", status: result });
      } catch (error) {
        console.error("Error sending email via POST endpoint:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        const statusCode = errorMessage.includes("User not authorized") ? 401 : 500;
        return res.status(statusCode).send({
          message: "Failed to send email",
          error: errorMessage,
        });
      }
    });
  },
};

export default config;