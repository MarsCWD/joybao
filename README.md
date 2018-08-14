# 服务器配置流程
## 1. 默认以root登录服务器
`ssh root@114.55.88.135 -p 22`
## 2. 修改服务器名称
> 参考：https://help.aliyun.com/knowledge_detail/41305.html

```
vi /etc/sysconfig/network
vi  /etc/hostname(多用于Ubuntu)
vi /etc/hosts
hostnamectl set-hostname 主机名(CentOS)
```
## 3. 配置用户及权限
> 参考：http://www.cnblogs.com/wangxiang/p/3832155.html

###### 修改管理员密码：`passwd`
###### 接着，要新建一个普通的管理账号并设置密码，用于日常的系统管理。
```
$ useradd sjt2
$ passwd sjt2
```
###### 将用户添加进管理组，以便于统一管理管理员的权限。
`$ usermod -a -G wheel sjt2`
###### 设置新用户的sudo权限。
`$ visudo`
###### 执行visudo命令实际上编辑的是/etc/sudoers文件。 找到 root ALL=(ALL:ALL) ALL 这行，并下面添加一行
`sjt2    ALL=(ALL:ALL) ALL`
## 4. 配置SSH
`vi /etc/ssh/sshd_config`
###### 设置 port为16688
###### 注释以下代码：`PermitRootLogin yes`（用于禁止管理员登录）
###### 添加 `AllowUsers sjt2`
###### 重启 `sshd：ervice sshd restart`
## 5. 重新登录ssh(exit或者在阿里云重启服务器）
`ssh sjt2@114.55.88.135 -p 16688 `
## 6. 安装Nginx
`sudo vi /etc/yum.repos.d/nginx.repo`

```
[nginx]
name=nginx repo
baseurl=http://nginx.org/packages/centos/7/$basearch/
gpgcheck=0
enabled=1
```

`$ sudo yum install nginx`

## 6. 安装Redis
> 安装：http://keenwon.com/1335.html
> 配置：https://my.oschina.net/indestiny/blog/197272
>      https://redis.io/topics/quickstart

###### 切换到/usr/src 目录（如果你安装在别的目录，注意后面要一些路径也要修改），下载Redis
```
cd /usr/src
sudo wget http://download.redis.io/releases/redis-stable.tar.gz
sudo tar xzf redis-stable.tar.gz
cd xzf redis-stable.tar.gz
make
sudo make install
```
###### 修改redis.conf，打开后台运行选项：
```
daemonize yes
logfile /var/log/redis.log
```
###### 设置系统的overcommit_memory，执行
`vi /etc/sysctl.conf`

`vm.overcommit_memory = 1`
###### 复制初始化脚本
`sudo cp utils/redis_init_script /etc/init.d/redis`
###### (需要在/etc/init.d/redis文件中增加chkconfig支持）
```
# chkconfig: 2345 10 90
# description: Start and Stop redis
```
###### 可能需要修改的地方：
`CONF="/usr/local/redis/redis.conf"`
###### 增加日志文件：
`sudo touch /var/log/redis.log`
###### 设置权限和开机启动
```
chmod +x /etc/init.d/redis
chkconfig --add redis
chkconfig redis on

```
## 7. 安装mongodb
`$ sudo vi /etc/yum.repos.d/mongodb.repo`
```
[mongodb]
name=MongoDB Repository
baseurl=http://mirrors.aliyun.com/mongodb/yum/redhat/7/mongodb-org/stable/x86_64/
gpgcheck=0
enabled=1
```
`yum install mongodb-org`
###### 添加脚本执行权限
`sudo chmod +x /etc/rc.d/init.d/mongod`
`sudo chkconfig mongod on`
###### 启动MongoDB
`sudo service mongod start`
## 8. 安装nvm（node）
`wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash`

exit退出重新登录ssh
`command -v nv`
`nvm install stable`
## 9. 安装git
> 参考：https://www.digitalocean.com/community/tutorials/how-to-install-git-on-centos-7

`sudo yum install autoconf`
## 10. 安装 npm
## 11. 配置防火墙
`systemctl start firewalld`
`firewall-cmd --zone=public --add-port=80/tcp --permanent`

重新加载配置
`firewall-cmd --reload`
