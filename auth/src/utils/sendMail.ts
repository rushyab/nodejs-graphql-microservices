import sgMail, { MailDataRequired } from '@sendgrid/mail';
import { NODE_ENV, SENDGRID_API_KEY } from '../config';
import { NodeEnvEnum, SENDGRID_SENDER_ID } from '../constants/common';
import LoggerService from './logger';

const mailTemplates = {
  reset_password: 'd-9c46bc0b11a34649a33bc71d0939e4cd',
  login_otp: 'd-0c892b02d88846f9b96c79a68a329fab',
};

/* eslint-disable camelcase */
export type TemplateDynamicDataMap = {
  reset_password: { code: string };
  login_otp: { otp: string };
};

export type MailTemplateNames = keyof typeof mailTemplates;
interface IMailData<T extends MailTemplateNames> {
  to: string;
  subject?: string;
  text?: string;
  html?: string;
  templateName?: T;
  templateData?: TemplateDynamicDataMap[T];
  attachments?: Array<{
    content: string; // base64
    filename: string;
    type: 'application/pdf' | 'text/csv';
    disposition: 'attachment';
  }>;
}

interface IMailDataTextContent<T extends MailTemplateNames>
  extends IMailData<T> {
  subject: string;
  text: string;
}

interface IMailDataHTMLContent<T extends MailTemplateNames>
  extends IMailData<T> {
  subject: string;
  html: string;
}

interface IMailDataTemplate<T extends MailTemplateNames> extends IMailData<T> {
  templateName: T;
}

type MailData<T extends MailTemplateNames> =
  | IMailDataTemplate<T>
  | IMailDataHTMLContent<T>
  | IMailDataTextContent<T>;

sgMail.setApiKey(SENDGRID_API_KEY);

const logger = new LoggerService('EmailService');

export default async function sendMail<T extends MailTemplateNames>(
  mailData: MailData<T>,
): Promise<void> {
  const from = SENDGRID_SENDER_ID;

  const { templateData, templateName, ...rest } = mailData;

  const data: Omit<MailDataRequired, 'content'> = {
    ...rest,
    templateId: templateName && mailTemplates[templateName],
    dynamicTemplateData: templateData,
    from,
  };

  if (NODE_ENV !== NodeEnvEnum.testing) {
    await sgMail
      .send(data as MailDataRequired)
      .then((value) => logger.info('Send mail response', value));
  }
}
