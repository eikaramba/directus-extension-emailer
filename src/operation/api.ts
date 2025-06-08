import { defineOperationApi } from "@directus/extensions-sdk";

export type Options = {
	to: string;
	type: 'wysiwyg' | 'markdown' | 'template';
  attachments?: string;
  files?: string;
	subject: string;
	body?: string;
	template?: string;
	data?: Record<string, any>;
	cc?: string;
	bcc?: string;
	replyTo?: string;
};

// ...existing code...
export default defineOperationApi<Options>({
  id: "emailer",
  handler: async (options: Options, { env, logger, accountability, getSchema }) => {

    console.log("Executing emailer operation with options:", options);

    let fileIds: string[] = [];
    if (options.files && typeof options.files === 'string') {
      // Assuming files is a comma-separated string of file IDs
      fileIds = options.files.split(',').map(id => id.trim()).filter(id => id);
    }

    // Construct payload based on what the endpoint `index.ts` actually consumes
    const endpointPayload: {
      to: string;
      subject: string;
      template?: {
        name: string;
        data?: Record<string, any>;
      },
      attachments?: string;
      files?: string[];
	    body?: string;
      // The endpoint also accepts 'list' and 'attachments' (pre-formatted array),
      // but these are not directly available or in the correct format from `options`.
    } = {
      to: options.to,
      subject: options.subject,
    };

    if (options.type === 'template' && options.template) {
      endpointPayload.template = {
      name: options.template,
      data: options.data,
	  };
    } else if ((options.type === 'wysiwyg') && options.body) {
      endpointPayload.body = options.body;
    }

    if (options.attachments) {
      endpointPayload.attachments = options.attachments;
    }

    if (fileIds.length > 0) {
      endpointPayload.files = fileIds;
    }

    // Properties like cc, bcc, replyTo are in Options but not handled by the endpoint's `create` function.
    if (options.cc || options.bcc || options.replyTo) {
        logger.warn("cc, bcc, or replyTo options provided, but the current '/emailer' endpoint does not handle them. Consider updating the endpoint to pass these to MailService.");
    }

    // Remove undefined keys to keep payload clean, though `fetch` handles undefined fine.
    Object.keys(endpointPayload).forEach(key => (endpointPayload as Record<string, any>)[key] === undefined && delete (endpointPayload as Record<string, any>)[key]);

    try {
      if (!env.EMAIL_ALLOW_GUEST_SEND && (!accountability || !accountability.user)) {
        logger.warn("No authentication token found for calling the emailer endpoint. Sending may fail if guest sending is not allowed and the operation is not run by an authenticated user.");
      }

      logger.info(`Calling emailer function with payload: ${JSON.stringify(endpointPayload)}`);


      const result = await (globalThis as any).Emailer.sendEmail({
        accountability,
        schema: await getSchema(),
        body: endpointPayload
      });

      if (!result) {
        logger.error(`Error calling emailer function: ${result.status} ${result.statusText}`);
        throw new Error(`Failed to send email via function: ${result.statusText} (Status ${result.status})`);
      }

      logger.info(`Email function responded with: "${result}"`);

      // Operations don't typically return values that are used by other operations in a flow directly.
      // Successful execution implies success. If specific output is needed, it can be returned.
      return { success: true };

    } catch (error: any) {
      logger.error('Failed to call emailer function:', error);
      // Ensure the error is re-thrown so the operation fails visibly in Directus
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to send email due to an unexpected error: ${String(error)}`);
    }
  },
});