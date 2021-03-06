import * as qiniu from 'qiniu'

let ACCESS_KEY, SECRET_KEY, BUCKET, PUBLIC_DOMAIN

interface QiniuConfig {
  ACCESS_KEY: string
  SECRET_KEY: string
  BUCKET: string
  DOMAIN: string
}

export const init = (qiniu: QiniuConfig) => {
  ;(ACCESS_KEY = qiniu.ACCESS_KEY),
    (SECRET_KEY = qiniu.SECRET_KEY),
    (BUCKET = qiniu.BUCKET),
    (PUBLIC_DOMAIN = qiniu.DOMAIN)
}

export const upload = (localPath: string, name: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const mac = new qiniu.auth.digest.Mac(ACCESS_KEY, SECRET_KEY)

    const options = {
      scope: BUCKET
    }
    const putPolicy = new qiniu.rs.PutPolicy(options)
    const uploadToken = putPolicy.uploadToken(mac)

    const formUploader = new qiniu.form_up.FormUploader(new qiniu.conf.Config())
    const putExtra = formUploader.putFile(
      uploadToken,
      name,
      localPath,
      new qiniu.form_up.PutExtra(),
      (respErr, respBody, respInfo) => {
        if (respErr) return reject(respErr)
        if (respInfo.statusCode == 200) {
          const config = new qiniu.conf.Config()
          const bucketManager = new qiniu.rs.BucketManager(mac, config)
          const publicDownloadUrl = bucketManager.publicDownloadUrl(
            PUBLIC_DOMAIN,
            name
          )
          return resolve(publicDownloadUrl)
        } else {
          return reject(respBody)
        }
      }
    )
  })
