import picgo from 'picgo'
import { PluginConfig } from 'picgo/dist/utils/interfaces'
import crypto from 'crypto'


const generateSignature = (options: any, fileName: string): string => {
  const date = new Date().toUTCString()
  const mimeType = ''
  const path = options.path
  const strToSign = `PUT\n\n${mimeType}\n${date}\n/${options.bucketName}${path ? '/' + options.path: ''}/${fileName}`
  const signature = crypto.createHmac('sha1', options.accessKeySecret).update(strToSign).digest('base64')
  return `OBS ${options.accessKeyId}:${signature}`
}

const postOptions = (options: any, fileName: string, signature: string, image: Buffer): any => {
  const path = options.path
  return {
    method: 'PUT',
    url: `http://${options.bucketName}.${options.endpoint}${path ? '/' + options.path: ''}/${encodeURI(fileName)}`,
    headers: {
      Authorization: signature,
      Date: new Date().toUTCString(),
      'content-type': ''
    },
    body: image,
    resolveWithFullResponse: true
  }
}

const handle = async (ctx: picgo): Promise<picgo> => {
  const obsOptions = ctx.getConfig('picBed.huaweicloud-uploader')
  if (!obsOptions) {
    throw new Error('找不到华为OBS图床配置文件')
  }
  try {
    const imgList = ctx.output
    for (let i in imgList) {
      if (!imgList.hasOwnProperty(i)) continue
      const signature = generateSignature(obsOptions, imgList[i].fileName)
      let image = imgList[i].buffer
      if (!image && imgList[i].base64Image) {
        image = Buffer.from(imgList[i].base64Image, 'base64')
      }
      const options = postOptions(obsOptions, imgList[i].fileName, signature, image)
      const body = await ctx.Request.request(options)
      if (body.statusCode === 200 || body.statusCode === 201) {
        delete imgList[i].base64Image
        delete imgList[i].buffer
        const path = obsOptions.path
        imgList[i].imgUrl = `http://${obsOptions.bucketName}.${obsOptions.endpoint}${path ? '/' + encodeURI(path) : ''}/${imgList[i].fileName}`
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
  let userConfig = ctx.getConfig('picBed.huaweicloud-uploader')
  if (!userConfig) {
    userConfig = {}
  }
  return [
    {
      name: 'accessKeyId',
      type: 'input',
      default: userConfig.accessKeyId || '',
      message: 'AccessKeyId 不能为空',
      required: true
    },
    {
      name: 'accessKeySecret',
      type: 'password',
      default: userConfig.accessKeySecret || '',
      message: 'AccessKeySecret 不能为空',
      required: true
    },
    {
      name: 'bucketName',
      type: 'input',
      default: userConfig.bucketName || '',
      message: 'BucketName 不能为空',
      required: true
    },
    {
      name: 'endpoint',
      type: 'input',
      alias: '区域EndPoint',
      default: userConfig.endpoint || '',
      message: '区域EndPoint不能为空',
      required: true
    },
    {
      name: 'path',
      type: 'input',
      alias: '存储路径',
      message: 'img',
      default: userConfig.path || '',
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
