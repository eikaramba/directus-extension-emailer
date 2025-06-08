![Directus Mailer](/assets/banner.png)

# Directus eMailer 💬

An endpoint and a Flow Operation Node for sending emails with the Directus Nodemailer service. The Operation differs to the builtin operation in such a way, that it allows you to send emails with an attachment. Useful when you want to send invoices for example, which can be generated with my other Directus extension.

## Setup

Install via the marketplace or locally.


### Environment Variables

You can set the following environment variables to configure the email service. By default, the endpoint is not accepting connection from unauthenticated users, so you will need to set the `EMAIL_ALLOW_GUEST_SEND` variable to `true` if you want to allow guest sending (**DANGEROUS!** 🚨). Normally only admins can use the endpoint and the flow operation. Make sure to have the correct rights, or alternatively you can specify individual roles, who have access to the email service.

```
EMAIL_ALLOW_GUEST_SEND=false
EMAIL_ALLOWED_ROLES=COMMA_SEPARATED_LIST_OF_ROLES_UUIDS
```

## Authentication

Requests made by unauthenticated users will be rejected. Requests must be made with a cookie or bearer token unless guest sending is active. See above.

## Sending Notifications

An example `POST` request made to `https://<directusAppDomain>/emailer`
In this example we are sending a test message to two recipients.

```JSON
{
  "subject": "How cool is Directus?",
  "to": ["email@gmail.com", "email@hotmail.com"],
  "template": {
    "name": "default-template",
  }
}
```

### Liquid Templating 💧

You can build custom email templates with Liquid.js and add them to your `extensions/templates` folder to reference them as templates in your `POST` request. [@email templating](https://docs.directus.io/extensions/email-templates/#_1-create-a-template-file)

If you're unfamiliar with Liquid, data can be referenced in a template with this interpolation`{{title}}` [@data variables](https://liquidjs.com/tutorials/intro-to-liquid.html)

```JSON
{
  "from": "hello@ryntab.com",
  "to": "*********@gmail.com",
  "subject": "This email was made with Handlebars",
	"template" : {
    "name": "alert",
    "data" : {
      "title": "Im a title!",
      "subtitle": "Im a subtitle!",
      "body": "Im the body!"
	  }
  }
}
```

### Attachments 📦

To add attachments in your email notification, include an array of attachment objects. [@attachments](https://nodemailer.com/message/attachments/)

```JSON
{
  "subject": "How cool is Directus?",
  "to": "email@gmail.com",
  "template": {
    "name": "default-template",
  }
  "attachments": [
    {
        "name": "image.png",
        "path": "./public/images/image.png"
    },
    {
      "name": "image_2.png",
      "path": "./public/images/image_2.png"
    }
  ]
}
```

### Directus File Attachments

You can also include Directus files as attachments with an array of reference IDs. If the current user has permissions to view the file, then it will be attached to the email notification.

> Note: Reference IDs that do not exist or do not meet the access requirements will be ignored.

```JSON
{
  "subject": "How cool is Directus?",
  "to": "email@gmail.com",
  "template": {
    "name": "default-template",
  },
  "files":  [
	  "c17d967b-b257-414d-ab92-41ae6d0784ed",
		"b507c26f-1333-4a8a-b8df-9731be74542e"
	]
}
```

You can include both attachments and Directus files in your email notification.

```JSON
{
  "subject": "How cool is Directus?",
  "to": "email@gmail.com",
  "template": {
    "name": "default-template",
  },
  "files":  [
	  "c17d967b-b257-414d-ab92-41ae6d0784ed",
	  "b507c26f-1333-4a8a-b8df-9731be74542e"
  ],
  "attachments": [
    {
      "filename": "text1.txt",
      "content": "hello world!"
    }
  ]
}
```

## Acknowledgements

This repo was cloned from [Directus eMailer](https://github.com/ryntab/Directus-Mailer) and modified to support attachments and to add a Flow Operation Node.