import fs from 'node:fs'
import COS from 'cos-nodejs-sdk-v5'
import { requireEnv, uploadAll } from './upload-utils.js'

requireEnv(['COS_SECRET_ID', 'COS_SECRET_KEY', 'COS_BUCKET', 'COS_REGION'])
const client = new COS({
  SecretId: process.env.COS_SECRET_ID,
  SecretKey: process.env.COS_SECRET_KEY,
})
await uploadAll((file, headers) => new Promise((resolve, reject) => {
  const stream = fs.createReadStream(file.localPath)
  stream.on('error', reject)
  client.putObject({
    Bucket: process.env.COS_BUCKET,
    Region: process.env.COS_REGION,
    Key: file.remotePath,
    Body: stream,
    ContentLength: fs.statSync(file.localPath).size,
    ContentType: headers['Content-Type'],
    CacheControl: headers['Cache-Control'],
  }, (error, data) => error ? reject(error) : resolve(data))
}), process.env.COS_PREFIX)
