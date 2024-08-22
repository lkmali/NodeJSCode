import { env } from '../../config'
import { awsConfig } from './aws.service'
export class S3CloudFrontService {
  cloudFront = new awsConfig.CloudFront.Signer(env.AWS_ACCESS_KEY_ID, env.CLOUD_FRONT_PRIVATE_KEY)
  async getImageUploadSignInUrl (key: string): Promise<string> {
    return new Promise((resolve) => {
      const url = this.cloudFront.getSignedUrl({
        url: `${env.AWS_CLOUD_FRONT_BASE_URL}/${key}`,
        expires: env.SIGN_URL_EXPIRE_TIME_FOR_PROFILE_IMAGE
      })
      return resolve(url)
    })
  }

  // async getImageDownloadSignInUrl (key: string): Promise<string> {
  //   const url = await this.s3.getSignedUrlPromise('getObject', {
  //     Bucket: env.AWS_BUCKET_NAME,
  //     Key: key,
  //     Expires: env.SIGN_URL_EXPIRE_TIME_FOR_PROFILE_IMAGE
  //   })
  //   return url
  // }
}
