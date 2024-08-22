import * as nodemailer from 'nodemailer'

import { env } from '../../config'
import { EmailRequest } from '../../typings'
export class AwsSmtpEmailService {
  async sendEmail (emailRequest: EmailRequest) {
    const transporter = nodemailer.createTransport(env.awsEmailSmtp)
    await transporter.sendMail({
      from: env.FROM_EMAIL,
      to: emailRequest.to,
      subject: emailRequest.subject,
      html: emailRequest.html
    })
  }
}
