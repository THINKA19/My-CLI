import OSS from 'ali-oss'
import { requireEnv, uploadAll } from './upload-utils.js'

requireEnv(['OSS_REGION', 'OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET', 'OSS_BUCKET'])
const client = new OSS({
  region: process.env.OSS_REGION,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET,
  secure: true,
  ...(process.env.OSS_ENDPOINT ? { endpoint: process.env.OSS_ENDPOINT } : {}),
})
await uploadAll((file, headers) => client.put(file.remotePath, file.localPath, { headers }), process.env.OSS_PREFIX)
