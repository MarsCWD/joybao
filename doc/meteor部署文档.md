# 物流对接文档

[TOC]

## 一. 配置本地运行环境

- 下载安装 meteor

  - *nix: 命令行安装 `curl https://install.meteor.com | /bin/sh`
  - win: windows exe安装 `https://install.meteor.com/windows`

- 安装node

  - win: url(<https://github.com/coreybutler/nvm-windows>)
  - *nix: url(<https://github.com/creationix/nvm>)

- npm安装 pm2 pm2-meteor

  - 安装pm2 `npm i pm2 -g`
  - 安装pm2-meteor `npm i pm2-meteor -g`

- 进入Meteor目录下 当前meteor项目 源码为joybao-meteor

- 执行命令 `meteor npm i` 安装所需依赖包

## 二. 配置服务器运行环境

- 参考REAME.md 进行服务器相关基本配置
- 服务端npm安装pm2 (命令参考 一)
- 执行 init_mongo.js (如数据库地址有变化, 请对照修改)

  - 脚本 `mongo localhost:27017/joybao -quiet ./init_mongo.js`

- 利用 mongorestore 导入配置 (如数据库地址有变化, 请对照修改)

  - 模板配置 `mongorestore -h localhost:27017 -d joybao -c Template Template.bson`
  - 套餐包配置 `mongorestore -h localhost:27017 -d joybao -c Package Package.bson`

- 在当前用户目录下建立 joybao-data文件夹 并在其下建立 contract 文件夹 和 logs文件夹

## 三. 配置pm2-meteor 配置文件

- 创建pm2-meteor配置文件 进入 meteor项目根目录 `pm2-meteor init`

  - 具体配置内容参见 pm2-meteor.json

## 四. pm2-meteor 进行服务器部署

- 进入 pm2-meteor.json 文件所在目录

  - 部署 `pm2-meteor deploy`
  - 卸载 `pm2-meteor undeploy`
  - 开始 `pm2-meteor start`
  - 停止 `pm2-meteor stop`
