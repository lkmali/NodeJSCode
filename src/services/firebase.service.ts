
import * as admin from 'firebase-admin'
import { isNil, values } from 'lodash'
import { env } from '../config'
import { FirebaseConfig, FirebaseUserSnapshot, NotificationResponse, PushNotificationError, SendNotificationResult, TopicPushNotificationRequest } from '../typings'

export class FirebaseService {
  private static instance: FirebaseService
  firebase: object
  adminSdk: FirebaseConfig
  constructor() {
    this.adminSdk = env.firebaseConfig
    this.firebase = admin.apps.length === 0
      ? admin.initializeApp({
        credential: admin.credential.cert(this.adminSdk),
        databaseURL: this.adminSdk.databaseURL
      })
      : admin.app()
  }

  getFcmBody(data: any) {
    data['sound'] = 'default'
    data['image'] = 'https://app.laxman.com/images/Laxman-logo-updated.jpg'
    data['icon'] = 'https://app.laxman.com/images/Laxman-logo-updated.jpg'
    return data
  }
  // async createNotification(payload: Notification, modifiedBy: ObjectID): Promise<void> {
  //   const notificationData = {
  //     _id: new ObjectID(),
  //     title: payload.title,
  //     body: payload.body,
  //     topic: payload.topic ?? this.env.defaultTopic,
  //     picture: payload.picture ?? '',
  //     icon: payload.icon ?? '',
  //     published: false,
  //     type: payload.type,
  //     modifiedBy,
  //     createdOn: new Date()
  //   } as Notification
  //   if (!isNil(payload.scheduledTime)) {
  //     notificationData.scheduledTime = new Date(payload.scheduledTime)
  //     if (notificationData.scheduledTime < moment(new Date()).add(30, 'minutes').toDate())
  //       throw new HttpErrors.BadRequest('Schedule time should be more than 30 mins of current time')
  //   }
  //   await this.notificationRepository.collection.insertOne(notificationData)
  // }

  async sendSingleOrMultiCastNotifications(data: string): Promise<NotificationResponse> {
    const failedTokens: PushNotificationError[] = []
    const tokens = await this.getFirebaseRegistrationTokens()
    let tokenIndexStart = 0
    let tokenIndexEnd = 500
    while (tokenIndexStart < tokens.length) {
      const tokenBatch = tokens.slice(tokenIndexStart, tokenIndexEnd)
      const body = this.getFcmBody(JSON.parse(data))
      const messageResult = await admin.messaging().sendEach(tokenBatch.map(token => ({
        token,
        notification: { title: body.title, body: body.body },
        data: body,
        android: { priority: 'high', data: body }
      })))
      if (messageResult.failureCount > 0)
        messageResult.responses.forEach((resp, idx) => {
          if (!resp.success)
            failedTokens.push({
              failedToken: tokenBatch[idx],
              errorMessage: resp.error !== undefined ? resp.error.message : 'Unexpected Error'
            })
        })
      tokenIndexStart += 500
      tokenIndexEnd += 500
    }
    if (failedTokens.length > 0)
      throw new Error(JSON.stringify(failedTokens))
    return { status: 'OK', message: 'Sent successfully' }
  }

  async sendTopicNotifications(data: string, topic: 'user'): Promise<SendNotificationResult> {
    try {
      const body = this.getFcmBody(JSON.parse(data))
      const result = await admin.messaging().send({
        data: body,
        topic,
        notification: { title: body.title, body: body.body },
        android: { priority: 'high', data: body }
      })
      return {
        status: 200,
        result
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.log('err', err)
      throw err
    }
  }

  // async saveUserTokenNotification({ data, topic }: TopicPushNotificationRequest): Promise<SendNotificationResult> {
  //   try {
  //     const result = await admin.messaging().send({ data, topic, android: { priority: 'high' } })
  //     return {
  //       status: 200,
  //       result
  //     }
  //   } catch (err: any) {
  //     return {
  //       status: 500,
  //       result: JSON.stringify(err)
  //     }
  //   }
  // }

  // async saveUserTokenWithTopic({ data, topic }: TopicPushNotificationRequest): Promise<SendNotificationResult> {
  //   try {
  //     const result = await admin.messaging().send({ data, topic, android: { priority: 'high' } })
  //     return {
  //       status: 200,
  //       result
  //     }
  //   } catch (err: any) {
  //     return {
  //       status: 500,
  //       result: JSON.stringify(err)
  //     }
  //   }
  // }

  async subscribeUserToTopic(registrationToken: string, topic: string): Promise<void> {
    await admin.messaging().subscribeToTopic(registrationToken, topic)
  }

  async sendUserBaseNotifications(token: string, { data, topic }: TopicPushNotificationRequest): Promise<SendNotificationResult> {
    try {
      const result = await admin.messaging().send({ data, token, topic, android: { priority: 'high' } })
      return {
        status: 200,
        result
      }
    } catch (err: any) {
      return {
        status: 500,
        result: JSON.stringify(err)
      }
    }
  }

  // async deleteNotification(_id: ObjectID, modifiedBy: ObjectID): Promise<void> {
  //   const result = await this.notificationRepository.collection.updateOne(
  //     { _id, published: false },
  //     { $set: { deletedOn: new Date(), modifiedBy } }
  //   )
  //   if (result.modifiedCount < 1) throw new HttpErrors.NotFound('Record not found or it is already published')
  // }

  // async searchNotifications(
  //   filter: Pick<Filter<Notification>, 'where' | 'limit' | 'offset' | 'order'>, response: Response, search?: string
  // ): Promise<Notification[]> {
  //   const regex = (!isNil(search)) ? { title: { $regex: new RegExp(`.*${search}.*`, 'i') } } : {}
  //   const { limit: $limit, skip: $skip } = paginate(filter)
  //   const where = { ...filter?.where }
  //   set(where, '$or', [{ deletedOn: { $type: 10 } }, { deletedOn: { $exists: false } }])
  //   await setCountHeaders({ response, where, repository: this.notificationRepository })
  //   return this.notificationRepository.collection.find({ ...where, ...regex })
  //     .sort({ createdOn: -1 }).skip($skip).limit($limit).toArray()
  // }

  // async sendInstantNotification(notification: any): Promise<void> {
  //   const data = { title: notification.title, body: notification.body, bigPicture: notification.picture, largeIcon: notification.icon }
  // }

  async saveFirebaseMessagingToken(registrationToken: string, userId: string): Promise<void> {
    const databaseInstance = admin.database()
    const usersRef = databaseInstance.ref('/users')
    const userExist = (await databaseInstance.ref(`/users/${userId}`).once('value')).exists()
    if (userExist)
      return

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.subscribeUserToTopic(registrationToken, 'user')

    await usersRef.child(`${userId}`).set({
      userId,
      registrationToken
    })
  }

  async getFirebaseMessagingToken(userId: string): Promise<string> {
    const databaseInstance = admin.database()
    // const usersRef = databaseInstance.ref('/users')

    const usersSnapshot = await databaseInstance.ref(`/users/${userId}`).once('value')
    const usersWithRegistrationTokens = usersSnapshot.val() as FirebaseUserSnapshot

    // eslint-disable-next-line no-console
    console.log('usersWithRegistrationTokens', usersWithRegistrationTokens)
    return ''
  }

  async removeFirebaseMessagingToken(userId: string): Promise<void> {
    const databaseInstance = admin.database()
    const usersRef = databaseInstance.ref('/users')
    const userExist = (await databaseInstance.ref(`/users/${userId}`).once('value')).exists()
    if (!userExist)
      throw new Error('User is not subscribed to receive notification')
    await usersRef.child(`${userId}`).remove()
  }

  protected async getFirebaseRegistrationTokens(): Promise<string[]> {
    const usersRef = admin.database().ref('/users')
    const usersSnapshot = await usersRef.once('value')
    const usersWithRegistrationTokens = usersSnapshot.val() as FirebaseUserSnapshot
    return values(usersWithRegistrationTokens ?? {}).map(item => item.registrationToken)
  }

  public static get Instance() {
    if (isNil(this.instance))
      this.instance = new this()

    return this.instance
  }
}
