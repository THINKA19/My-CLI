import fs from 'node:fs'
import { required } from './check-config.js'
import { uploadAll } from './upload-utils.js'

export async function deploy(root, t, { output, files }) {
  required(['COS_SECRET_ID', 'COS_SECRET_KEY'])
  const { default: COS } = await import('cos-nodejs-sdk-v5')
  const client = new COS({ SecretId: process.env.COS_SECRET_ID, SecretKey: process.env.COS_SECRET_KEY })
  const upload = (key, file, headers) => new Promise((resolve, reject) => client.putObject({ Bucket: t.bucket, Region: t.region, Key: key, Body: fs.createReadStream(file), ContentLength: fs.statSync(file).size, ContentType: headers['Content-Type'], CacheControl: headers['Cache-Control'] }, (err, data) => err ? reject(err) : resolve(data)))

  await uploadAll(t, output, files, upload)
}
