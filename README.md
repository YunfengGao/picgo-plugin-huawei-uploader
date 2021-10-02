# picgo-plugin-huaweicloud-uploader

[PicGo](https://github.com/Molunerfinn/PicGo) 华为云OBS上传插件。

## 插件安装 Installation
GUI 直接搜索 _huawei_ 下载即可
![install](https://nebulas.obs.cn-south-1.myhuaweicloud.com/picgo/20211002112806.png)

## 插件配置 Configuration

![config](https://nebulas.obs.cn-south-1.myhuaweicloud.com/picgo/20211002112519.png)

|参数名称|类型|描述|是否必须|
|----|----|----|----|
|AccessKeyId|input|从`我的凭证-访问密钥`获取|true|
|AccessKeySecret|password|从`我的凭证-访问密钥`获取|true|
|桶名称|input|从`OBS控制台`获取|true|
|EndPoint|input|桶基本信息中的Endpoint，从`OBS控制台`获取|true|
|存储路径|input|图片在OBS中的存储路径，用户自定义|false|
|网址后缀|input|图片处理表达式，用户自定义|false|
|自定义域名|input|使用自定义域名替代OBS桶的域名，用户自定义|false|