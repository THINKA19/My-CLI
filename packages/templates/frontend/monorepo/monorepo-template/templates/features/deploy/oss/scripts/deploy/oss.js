import { required } from './check-config.js'
import { uploadAll } from './upload-utils.js'

export async function deploy(root, t, { output, files }) {
  required(['OSS_ACCESS_KEY_ID', 'OSS_ACCESS_KEY_SECRET'])
  const { default: OSS } = await import('ali-oss')
  const client = new OSS({ region: t.region, bucket: t.bucket, accessKeyId: process.env.OSS_ACCESS_KEY_ID, accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET, secure: true })
  const upload = (key, file, headers) => client.put(key, file, { headers })

  await uploadAll(t, output, files, upload)
}
