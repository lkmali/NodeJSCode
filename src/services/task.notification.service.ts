import { isNil } from 'lodash'
import { TasksRepository } from '../database/repository'
import { Tasks, Users } from '../typings'
import { WhatsappService } from './whatsapp.services'

export class TaskNotificationService {
  private static instance: TaskNotificationService
  private readonly tasksRepository: TasksRepository

  constructor() {
    this.tasksRepository = new TasksRepository()
  }

  public async sendNotificationToTaskUsers(taskId: number) {
    const data = await this.tasksRepository.getTaskUsers(taskId)
    const user = data['Users']
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    Promise.allSettled(user.map((value: Users) => this.notifyUserOnTaskAssigns(value.phone, value.username, data)))
  }

  public async notifyUserOnTaskAssigns(phone: string, username: string, task: Tasks) {
    const template = WhatsappService.Instance.getTextMessageInput(`91${phone}`, task, username)
    await WhatsappService.Instance.sendMessage(template)
  }

  public static get Instance() {
    if (isNil(this.instance))
      this.instance = new this()

    return this.instance
  }
}
