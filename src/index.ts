import picgo from 'picgo'
import { PluginConfig } from 'picgo/dist/utils/interfaces'
import crypto from 'crypto'
const mime_types = require("mime")

const generateSignature = (options: any, fileName: string): string => {
  const date = new Date().toUTCString()
  const mimeType = mime_types.getType(fileName)
  if (!mimeType) {
    throw Error(`No mime type found for file ${fileName}`)
  }
  const path = options.path
  const strToSign = `PUT\n\n${mimeType}\n${date}\n/${options.bucketName}${path ? '/' + encodeURI(options.path) : ''}/${encodeURI(fileName)}`
  const signature = crypto.createHmac('sha1', options.accessKeySecret).update(strToSign).digest('base64')
  return `OBS ${options.accessKeyId}:${signature}`
}

const postOptions = (options: any, fileName: string, signature: string, image: Buffer): any => {
  const path = options.path
  const mimeType = mime_types.getType(fileName)
  return {
    method: 'PUT',
    url: `https://${options.bucketName}.${options.endpoint}${path ? '/' + encodeURI(options.path) : ''}/${encodeURI(fileName)}`,
    headers: {
      Authorization: signature,
      Date: new Date().toUTCString(),
      'content-type': mimeType
    },
    body: image,
    resolveWithFullResponse: true
  }
}

const handle = async (ctx: picgo): Promise<picgo> => {
  const obsOptions = ctx.getConfig<config>('picBed.huaweicloud-uploader')
  if (!obsOptions) {
    throw new Error('找不到华为OBS图床配置文件')
  }
  try {
    const images = ctx.output
    for (const img of images) {
      if (img.fileName && img.buffer) {
        const signature = generateSignature(obsOptions, img.fileName)
        let image = img.buffer
        if (!image && img.base64Image) {
          image = Buffer.from(img.base64Image, 'base64')
        }
        const options = postOptions(obsOptions, img.fileName, signature, image)
        const response = await ctx.request(options)
        if (response.statusCode === 200) {
          delete img.base64Image
          delete img.buffer
          const path = obsOptions.path
          img.imgUrl = `https://${obsOptions.bucketName}.${obsOptions.endpoint}${path ? '/' + path : ''}/${img.fileName}`
          if (obsOptions.imageProcess) {
            img.imgUrl += obsOptions.imageProcess
          }
        }
      }
    }
    return ctx
  } catch (err) {
    let message = err.message
    ctx.emit('notification', {
      title: '上传失败！',
      body: message
    })
  }
}

const config = (ctx: picgo): PluginConfig[] => {
  const userConfig = ctx.getConfig<config>('picBed.huaweicloud-uploader') ||
  {
    accessKeyId: '',
    accessKeySecret: '',
    bucketName: '',
    endpoint: '',
    path: '',
    imageProcess: ''
  }
  return [
    {
      name: 'accessKeyId',
      type: 'input',
      alias: 'AccessKeyId',
      default: userConfig.accessKeyId || '',
      message: 'AccessKeyId 不能为空',
      required: true
    },
    {
      name: 'accessKeySecret',
      type: 'password',
      alias: 'AccessKeySecret',
      default: userConfig.accessKeySecret || '',
      message: 'AccessKeySecret 不能为空',
      required: true
    },
    {
      name: 'bucketName',
      type: 'input',
      alias: 'BucketName',
      default: userConfig.bucketName || '',
      message: 'BucketName 不能为空',
      required: true
    },
    {
      name: 'endpoint',
      type: 'input',
      alias: 'EndPoint',
      default: userConfig.endpoint || '',
      message: 'EndPoint 不能为空',
      required: true
    },
    {
      name: 'path',
      type: 'input',
      alias: '存储路径',
      message: '如img或img/github',
      default: userConfig.path || '',
      required: false
    },
    {
      name: 'imageProcess',
      type: 'input',
      alias: '图片处理',
      message: '如 ?x-image-process=image/resize,p_100',
      default: userConfig.imageProcess || '',
      required: false
    }
  ]
}

export = (ctx: picgo) => {
  const register = () => {
    ctx.helper.uploader.register('huaweicloud-uploader', {
      handle,
      name: '华为云OBS',
      config: config
    })
  }
  return {
    uploader: 'huaweicloud-uploader',
    register
  }
}
