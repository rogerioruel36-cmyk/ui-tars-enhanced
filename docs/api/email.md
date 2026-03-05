# Email Processing API

## Overview

The Email module provides IMAP/SMTP integration for receiving, sending, and auto-processing emails.

## Class: ImapClient

```javascript
const { ImapClient } = require('./src/email/ImapClient');
```

### Constructor

```javascript
new ImapClient(options)
```

**Parameters:**
- `options` (Object): IMAP configuration
  - `host` (string): IMAP server host
  - `port` (number): IMAP port
  - `user` (string): Username
  - `password` (string): Password
  - `tls` (boolean): Enable TLS

### Methods

#### connect()

Connect to IMAP server.

```javascript
const client = new ImapClient({
  host: 'imap.example.com',
  port: 993,
  user: 'user@example.com',
  password: 'password',
  tls: true
});

await client.connect();
```

#### listFolders()

List all folders.

```javascript
const folders = await client.listFolders();
console.log(folders);
// ['INBOX', 'Sent', 'Drafts', 'Archive']
```

#### selectFolder(folder)

Select a folder.

```javascript
await client.selectFolder('INBOX');
```

#### fetchEmails(criteria, options?)

Fetch emails.

```javascript
const emails = await client.fetchEmails('UNSEEN', {
  limit: 10,
  markSeen: false
});

for (const email of emails) {
  console.log('From:', email.from);
  console.log('Subject:', email.subject);
  console.log('Body:', email.text);
}
```

#### getEmail(uid)

Get a specific email by UID.

```javascript
const email = await client.getEmail(12345);
```

#### moveEmail(uid, targetFolder)

Move an email.

```javascript
await client.moveEmail(12345, 'Archive');
```

#### deleteEmail(uid)

Delete an email.

```javascript
await client.deleteEmail(12345);
```

#### disconnect()

Disconnect from server.

```javascript
await client.disconnect();
```

## Class: SmtpClient

```javascript
const { SmtpClient } = require('./src/email/SmtpClient');
```

### Constructor

```javascript
new SmtpClient(options)
```

**Parameters:**
- `options` (Object): SMTP configuration
  - `host` (string): SMTP server host
  - `port` (number): SMTP port
  - `user` (string): Username
  - `password` (string): Password
  - `secure` (boolean): Enable TLS/SSL

### Methods

#### connect()

Connect to SMTP server.

```javascript
const client = new SmtpClient({
  host: 'smtp.example.com',
  port: 465,
  user: 'user@example.com',
  password: 'password',
  secure: true
});

await client.connect();
```

#### send(email)

Send an email.

```javascript
await client.send({
  from: 'sender@example.com',
  to: ['recipient@example.com'],
  cc: ['cc@example.com'],
  subject: 'Test Email',
  text: 'Email body',
  html: '<p>Email body</p>',
  attachments: ['./file.pdf']
});
```

#### disconnect()

Disconnect from server.

```javascript
await client.disconnect();
```

## Class: EmailClassifier

```javascript
const { EmailClassifier } = require('./src/email/EmailClassifier');
```

### Constructor

```javascript
new EmailClassifier(options?)
```

### Methods

#### train(categories)

Train the classifier.

```javascript
await classifier.train({
  work: ['email1.txt', 'email2.txt'],
  personal: ['email3.txt', 'email4.txt'],
  promotions: ['email5.txt']
});
```

#### classify(email)

Classify an email.

```javascript
const category = await classifier.classify(emailBody);
console.log(category); // 'work', 'personal', 'promotions', etc.
```

#### classifyBatch(emails)

Batch classify emails.

```javascript
const results = await classifier.classifyBatch(emails);
```

## Class: AutoReply

```javascript
const { AutoReply } = require('./src/email/AutoReply');
```

### Constructor

```javascript
new AutoReply(options?)
```

### Methods

#### addRule(rule)

Add an auto-reply rule.

```javascript
autoReply.addRule({
  condition: {
    subject: /urgent/i,
    from: /@company\.com/
  },
  response: {
    subject: 'Re: {{subject}}',
    body: 'Thank you for your message. We will respond shortly.'
  }
});
```

#### process(email)

Process an email and generate auto-reply.

```javascript
const response = await autoReply.process(email);
if (response.shouldReply) {
  await smtpClient.send(response.email);
}
```

## Example: Email Automation

```javascript
const { ImapClient, SmtpClient, EmailClassifier, AutoReply } = require('./src/email');

async function main() {
  // Setup IMAP
  const imap = new ImapClient({
    host: 'imap.example.com',
    port: 993,
    user: 'user@example.com',
    password: 'password',
    tls: true
  });

  // Setup SMTP
  const smtp = new SmtpClient({
    host: 'smtp.example.com',
    port: 465,
    user: 'user@example.com',
    password: 'password',
    secure: true
  });

  // Connect
  await imap.connect();
  await smtp.connect();

  // Select inbox
  await imap.selectFolder('INBOX');

  // Fetch unread emails
  const emails = await imap.fetchEmails('UNSEEN', { limit: 10 });

  // Classify and process
  const classifier = new EmailClassifier();

  for (const email of emails) {
    const category = await classifier.classify(email.body);

    if (category === 'work') {
      // Process work emails
      console.log('Work email:', email.subject);
    } else if (category === 'promotions') {
      // Move to promotions folder
      await imap.moveEmail(email.uid, 'Promotions');
    }
  }

  // Auto-reply
  const autoReply = new AutoReply();
  autoReply.addRule({
    condition: { subject: /help/i },
    response: {
      body: 'Thank you for contacting support. We will respond within 24 hours.'
    }
  });

  // Disconnect
  await imap.disconnect();
  await smtp.disconnect();
}

main();
```
