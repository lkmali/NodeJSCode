import AWS from 'aws-sdk'
import { env } from '../../config'
AWS.config = new AWS.Config({
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  region: env.AWS_REGION,
  signatureVersion: 'v4'
})
class AwsService {
  public static get awsConfig () {
    return AWS
  }
}

export const awsConfig = AwsService.awsConfig
