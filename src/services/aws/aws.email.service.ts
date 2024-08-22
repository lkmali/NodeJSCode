import { isNil } from 'lodash'
import { env } from '../../config'
import { EmailRequest } from '../../typings'
import { awsConfig } from './aws.service'
export class EmailService {
  async sendEmail(emailRequest: EmailRequest) {
    const body = !isNil(emailRequest.html)
      ? {
        Html: {
          Charset: 'UTF-8',
          Data: emailRequest.html
        }
      }
      : {
        Text: {
          Charset: 'UTF-8',
          Data: emailRequest.message
        }
      }

    const params: any = {
      Destination: {
        CcAddresses: emailRequest.cc,
        ToAddresses: emailRequest.to
      },
      Message: {
        Body: body,
        Subject: {
          Charset: 'UTF-8',
          Data: emailRequest.subject
        }
      },
      Source: 'Laxman <' + env.FROM_EMAIL + ">'" /* required */
    }

    // eslint-disable-next-line no-console
    console.log('params', params)

    await new awsConfig.SES().sendEmail(params).promise()
  }
}
