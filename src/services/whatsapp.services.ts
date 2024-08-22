
import axios from 'axios'
import { isNil } from 'lodash'
import moment from 'moment'
import { env } from '../config'
import { Tasks } from '../typings'
import { customError } from '../utils'
export class WhatsappService {
  private static instance: WhatsappService

  async sendMessage(data: string) {
    try {
      const config = {
        method: 'post',
        url: `${env.WHATSAPP_BASE_URL}/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        headers: {
          Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        data: data
      }
      const result = await axios(config)
      // console.log('result.data', result.data)
      return result.data
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.log('console.data', error.data)

      // eslint-disable-next-line no-console
      console.log('error.response.data', error.response.data)
      if (!isNil(error) && !isNil(error.response) && !isNil(error.response.data))
        throw customError(error.response.data.code, error.response.data.message)
    }
  }

  getTextMessageInput(recipient: string, task: Tasks, username: string) {
    return JSON.stringify({
      messaging_product: 'whatsapp',
      to: recipient,
      type: 'template',
      template: {
        name: 'assign_tasks ',
        language: {
          code: 'en'
        },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: username
              },
              {
                type: 'text',
                text: task.name
              },
              {
                type: 'text',
                text: moment(task.startDate).format('LL')
              }
            ]
          },
          {
            type: 'button',
            sub_type: 'URl',
            index: 0,
            parameters: [
              {
                type: 'TEXT',
                text: 'http://code1.laxman.com:5000'
              }
            ]
          }
        ]
      }
    }
    )
  }

  public static get Instance() {
    if (isNil(this.instance))
      this.instance = new this()

    return this.instance
  }
}
