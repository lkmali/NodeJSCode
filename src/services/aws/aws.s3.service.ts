import { Response } from 'express'
import { IncomingHttpHeaders } from 'http2'
import { isNil } from 'lodash'
import { env } from '../../config'
import { awsConfig } from './aws.service'
export class S3Service {
  private static instance: S3Service
  s3 = new awsConfig.S3()
  async getImageUploadSignInUrl(key: string, imageType: string): Promise<string> {
    const url = await this.s3.getSignedUrlPromise('putObject', {
      Bucket: env.AWS_BUCKET_NAME,
      Key: key,
      ContentType: imageType,
      Expires: env.SIGN_URL_EXPIRE_TIME_FOR_PROFILE_IMAGE
    })
    return url
  }

  async getImageDownloadSignInUrl(key: string, expires = env.SIGN_URL_EXPIRE_TIME_FOR_PROFILE_IMAGE): Promise<string> {
    const url = await this.s3.getSignedUrlPromise('getObject', {
      Bucket: env.AWS_BUCKET_NAME,
      Key: key,
      Expires: expires
    })
    return url
  }

  async getFIleData(key: string, res: Response): Promise<void> {
    return new Promise(() => {
      this.s3.getObject({
        Bucket: env.AWS_BUCKET_NAME,
        Key: key
      }, function (err, data) {
        if (!isNil(err)) {
          res.status(200)
          res.end('Error Fetching File')
        } else {
          res.attachment(key) // Set Filename
          res.type(data.ContentType ?? '') // Set FileType
          res.send(data.Body) // Send File Buffer
        }
      })
    })
  }

  async awsStream(data: { key: string; mimeType: string }, headers: IncomingHttpHeaders, response: Response) {
    return new Promise(() => {
      try {
        const file = data.key
        const bucket = env.AWS_BUCKET_NAME

        if (!isNil(headers) && !isNil(headers.range)) {
          const range = headers.range
          const bytes = range.replace(/bytes=/, '').split('-')
          const start = parseInt(bytes[0], 10)
          const end = bytes[1] ? parseInt(bytes[1], 10) : 1
          const chunksize = (end - start) + 1

          response.writeHead(206, {
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            authorize: 'true',
            'Cache-Control': 'max-age=3600, private'
          })

          return this.s3.getObject({ Bucket: bucket, Key: file, Range: range }).createReadStream().pipe(response)
        } else {
          response.writeHead(200, {
            'Cache-Control': 'max-age=3600, private',
            authorize: 'true'
          })
          return this.s3.getObject({ Bucket: bucket, Key: file }).createReadStream().pipe(response)
        }
      } catch (err) {
        return response.status(404).send({ message: 'Internal error' })
      }
    })
  }

  public static get Instance() {
    if (isNil(this.instance))
      this.instance = new this()

    return this.instance
  }
}
