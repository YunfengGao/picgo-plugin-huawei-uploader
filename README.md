## picgo-plugin-huaweicloud-uploader

An uploader for HuaweiCloud

[PicGo](https://github.com/Molunerfinn/PicGo) 华为云OBS上传插件。

### 安装 Installation
GUI 直接搜索 _huawei_ 下载即可


### 图床配置

![picgo.png](https://nebulas.obs.cn-south-1.myhuaweicloud.com/picgo/20211001164513.png)

### 配置

|参数名称|类型|描述|是否必须|
|:--:|:--:|:--:|:--:|
|accessKeyId|input|AccessKeyId|true|
|accessKeySecret|password|AccessKeySecret|true|
|bucketName|input|桶名称|true|
|EndPoint|input|桶基本信息中的Endpoint|true|
|图片在OBS中的存储路径|input|图片在OBS中的存储路径|false|
|图片处理|input|图片处理表达式|false|
|代理域名|input|使用自己的域名替代OBS桶的域名|false|