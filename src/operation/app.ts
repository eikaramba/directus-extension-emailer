import { defineOperationApp } from '@directus/extensions-sdk';

export default defineOperationApp({
  id: 'emailer',
  name: 'emailer',
  icon: 'mail',
  description: 'Send an email with an attachment',
  overview: ({ subject, to, type, cc, bcc, replyTo }) => [
        {
            label: '$t:subject',
            text: subject,
        },
        {
            label: '$t:operations.mail.to',
            text: Array.isArray(to) ? to.join(', ') : to,
        },
        {
            label: '$t:type',
            text: type || 'markdown',
        },
        ...[
            cc && {
                label: '$t:operations.mail.cc',
                text: Array.isArray(cc) ? cc.join(', ') : cc,
            },
            bcc && {
                label: '$t:operations.mail.bcc',
                text: Array.isArray(bcc) ? bcc.join(', ') : bcc,
            },
            replyTo && {
                label: '$t:operations.mail.reply_to',
                text: Array.isArray(replyTo) ? replyTo.join(', ') : replyTo,
            },
        ].filter((v) => v),
    ],
  options: (panel) => {
    return [
      {
        field: 'from',
        name: 'From',
        type: 'string',
        meta: {
          width: 'full',
          interface: 'input',
          note: 'The email address of the sender.',
          options: {
            placeholder: 'leave blank or sender@server.com or "Sender Name" sender@server.com',
          },
        },
      },
      {
        field: 'to',
        name: '$t:operations.mail.to',
        type: 'csv',
        meta: {
          width: 'half',
          interface: 'tags',
          note: 'Comma separated list of recipients email addresses.',
          options: {
            placeholder: 'Add e-mail address and press enter',
            iconRight: 'alternate_email',
          },
        },
      },
      {
        field: 'cc',
        name: '$t:operations.mail.cc',
        type: 'csv',
        meta: {
          width: 'half',
          interface: 'tags',
          options: {
            placeholder: 'Enter CC email addresses...',
            iconRight: 'alternate_email',
          },
        },
      },
      {
        field: 'bcc',
        name: '$t:operations.mail.bcc',
        type: 'csv',
        meta: {
          width: 'half',
          interface: 'tags',
          options: {
            placeholder: 'Enter BCC email addresses...',
            iconRight: 'alternate_email',
          },
        },
      },
      {
        field: 'replyTo',
        name: '$t:operations.mail.reply_to',
        type: 'csv',
        meta: {
          width: 'half',
          interface: 'tags',
          options: {
            placeholder: 'Enter reply-to email addresses...',
            iconRight: 'reply',
          },
        },
      },
      
      {
        field: 'subject',
        name: '$t:subject',
        type: 'string',
        meta: {
          width: 'full',
          interface: 'input',
          options: {
            iconRight: 'title',
          },
        },
      },
      {
        field: 'type',
        name: '$t:type',
        type: 'string',
        schema: {
          default_value: 'markdown',
        },
        meta: {
          interface: 'select-dropdown',
          width: 'half',
          options: {
            choices: [
              { 
                text: '$t:interfaces.input-rich-text-md.markdown',
                value: 'markdown',
              },
              {
                text: '$t:interfaces.input-rich-text-html.wysiwyg',
                value: 'wysiwyg',
              },
              {
                text: '$t:operations.mail.template',
                value: 'template',
              },
            ],
          },
        },
      },
      {
        field: 'template',
        name: '$t:operations.mail.template',
        type: 'string',
        meta: {
          interface: 'input',
          hidden: panel.type !== 'template',
          width: 'half',
          options: {
            placeholder: 'base',
          },
        },
      },
      {
        field: 'body',
        name: '$t:operations.mail.body',
        type: 'text',
        meta: {
          width: 'full',
          interface: 'input-rich-text-html',
          hidden: panel.type === 'template',
        },
      },
      { // Logic from app.ts
        field: 'data',
        name: '$t:operations.mail.data',
        type: 'json',
        meta: {
          width: 'full',
          interface: 'input-code',
          hidden: panel.type !== 'template',
          options: {
            language: 'json',
            placeholder: JSON.stringify(
              {
                url: 'example.com',
              },
              null,
              2,
            ),
            template: JSON.stringify(
              {
                url: 'example.com',
              },
              null,
              2,
            ),
          },
        },
      },
      {
        field: 'attachments',
        name: 'Attachments',
        type: 'json',
        meta: {
          width: 'full',
          interface: 'input-code',
          note: 'An array of attachment objects.',
          options: {
            language: 'json',
            placeholder: JSON.stringify(
              [
                {
                  filename: 'file.pdf',
                  path: './uploads/file.pdf',
                },
                {
                  filename: 'hello.txt',
                  content: 'Hello World',
                },
              ],
              null,
              2
            ),
            template: JSON.stringify(
              [
                {
                  filename: 'file.pdf',
                  path: './uploads/file.pdf',
                },
              ],
              null,
              2
            ),
          },
        },
      },
      { 
        field: 'files',
        name: 'Files',
        type: 'csv',
        meta: {
          width: 'full',
          interface: 'tags',
          note: 'Comma separated list of file IDs.',
          options: {
            placeholder: 'Add file ID and press enter',
            iconRight: 'attach_file',
          },
        },
      },
    ];
  },
});