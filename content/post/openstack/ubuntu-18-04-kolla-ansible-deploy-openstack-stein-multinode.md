---
title: Ubuntu 18.04 通过 Kolla Ansible 部署多节点 OpenStack Stein
description: 

date: 2019-12-14T00:00:00+08:00
lastmod: 2019-12-14T00:00:00+08:00

categories:
 - Work
tags:
 - OpenStack
 - Python
 - Shell

toc: true
---

## Virtual Box 安装 Ubuntu 18.04 Live Server

安装 3 台 Ubuntu 18.04，各配置一块 NAT 网卡和一块仅主机 (Host Only) 网卡，3 台的仅主机网络用同一个 Virtual Box 的虚拟网卡。主机名及 IP 如下：

```plain
controller: 192.168.56.10
compute1: 192.168.56.20
compute2: 192.168.56.30
```

## 准备工作（controller，compute1，compute2）

### 配置访问更快的 apt 源，pip 源（清华、阿里等）

### 安装 pip

```shell
apt install python-pip -y
```

### 更新 pip

```shell
pip install -U pip
```

### 安装 Docker

```shell
apt install docker.io -y
```

## 安装部署工具（controller）

### 安装依赖

```shell
apt install python-dev libffi-dev gcc libssl-dev python-selinux python-setuptools -y
```

### 安装 ansible

```shell
pip install ansible
```

### 安装 kolla ansible

```shell
git clone http://git.trystack.cn/openstack/kolla-ansible.git --branch stable/stein --depth 1 $HOME/kolla-ansible
```

{{< note >}}
上面使用了 OpenStack 国内 git 镜像
{{< /note >}}

### 安装 kolla ansible 依赖

```shell
pip install -U -r $HOME/kolla-ansible/requirements.txt
```

## 配置 Hosts（controller，compute1，compute2）（/etc/hosts）

### 注释掉主机名到 127.0.1.1 的映射

### 添加节点信息（controller）

```plain
192.168.56.10 controller
192.168.56.20 compute1
192.168.56.30 compute2
```

## 配置 kolla （controller）

### 拷贝全局配置 globals.yml 和密码配置 passwords.yml

```shell
cp -r $HOME/kolla-ansible/etc/kolla /etc/
```

### 拷贝多节点配置文件 multinode

```shell
cp $HOME/kolla-ansible/ansible/inventory/multinode $HOME/
```

### 生成随机密码

```shell
$HOME/kolla-ansible/tools/generate_passwords.py
```

### 配置 globals.yml，添加以下内容（/etc/kolla/globals.yml）

```yaml
kolla_dev_repos_git: "http://git.trystack.cn/openstack"
config_strategy: "COPY_ONCE"

kolla_base_distro: "ubuntu"
kolla_install_type: "source"
openstack_release: "stein"

kolla_internal_vip_address: "controller"
network_interface: "enp0s8" # Host Only network interface
neutron_external_interface: "enp0s3" # NAT network interface

node_custom_config: "/etc/kolla/config"

enable_haproxy: "no"
enable_cinder: "yes"
enable_cinder_backend_lvm: "yes"
enable_etcd: "yes"
enable_kuryr: "yes"
enable_zun: "yes"
enable_neutron_provider_networks: "yes"
enable_osprofiler: "yes"
enable_skydive: "yes"
enable_elasticsearch: "yes"

enable_aodh: "yes"
enable_gnocchi: "yes"
enable_panko: "yes"
enable_ceilometer: "yes"

enable_octavia: "yes"

nova_compute_virt_type: "qemu" # Must set this when deploying in virtual machines 
```

### 配置多节点信息（./multinode）

```ini
[control]
controller ansible_ssh_user=root

[network]
controller ansible_ssh_user=root

[compute]
controller ansible_ssh_user=root
compute1 ansible_ssh_user=root
compute2 ansible_ssh_user=root

[monitoring]
controller ansible_ssh_user=root

[storage]
controller ansible_ssh_user=root
compute1 ansible_ssh_user=root
compute2 ansible_ssh_user=root
```

### 在配置了 storage 的节点上挂载一块硬盘（controller, conpute1, compute2）

{{< note >}}
这里假设设备为 /dev/sdb
{{< /note >}}

```shell
free_device=/dev/sdb
pvcreate $free_device
vgcreate cinder-volumes $free_device
```

### 配置 SSH 密钥登录各节点，并确认主机指纹验证

### 测试多节点配置

```shell
ansible -i $HOME/multinode all -m ping
```

### 额外配置

chrony 绑定地址，/etc/kolla/config/chrony/chrony.conf

```ini
bindaddress 192.168.56.10
```

nova compute monitors，/etc/kolla/config/nova/nova.conf

```ini
[DEFAULT]
compute_monitors = cpu.virt_driver
```

octavia 配置 SSL 证书

1. 克隆 octavia git 仓库

    ```shell
    git clone http://git.trystack.cn/openstack/octavia.git --branch stable/stein --depth 1 $HOME/octavia
    ```

1. 生成 SSL 证书

    ```shell
    grep octavia_ca_password /etc/kolla/passwords.yml
    (这行是输出）octavia_ca_password: <octavia_ca_password>
    sed -i 's/foobar/<octavia_ca_password>/g' $HOME/octavia/bin/create_certificates.sh
    $HOME/octavia/bin/create_certificates.sh certs $HOME/octavia/etc/certificates/openssl.cnf
    ```

1. 拷贝 SSL 证书

    ```shell
    cp $HOME/certs/ca_01.pem certs/client.pem $HOME/certs/private/cakey.pem /etc/kolla/config/octavia/
    ```

## 获取 kolla 镜像（controller）

### 配置 Docker 仓库代理（可选）

在 `/etc/docker/daemon.json` 中添加

```json
{
  "registry-mirrors": ["https://docker.mirrors.sjtug.sjtu.edu.cn"]
}
```

重载 daemon，重启 docker

```shell
systemctl daemon-reload
systemctl restart docker
```

### 方式1，从 Docker Hub 拉取

```shell
$HOME/kolla-ansible/tools/kolla-ansible pull -vvv
```

### 方式2，本地 tar 导入

### 搭建本地 registry 服务器

```shell
docker run -d --name registry --restart=always -p 4000:5000 -v /opt/registry:/var/lib/registry registry
```

### 修改镜像 tag

```shell
for item in `docker images | grep stein | awk '{print $1}'`; do docker image tag $item:stein controller:4000/$item:stein; done
```

### 配置 kolla 使用本地 registry 服务器

在 /etc/kolla/globals.yml 中添加

```yaml
docker_registry: "controller:4000"
```

## Kolla Ansible Bootstrap Servers（controller）

```shell
$HOME/kolla-ansible/tools/kolla-ansible -i $HOME/multinode bootstrap-servers
```

## 拉取镜像至各节点（controller）

### 上传镜像至本地 registry 服务器

```shell
for item in `docker images | grep controller:4000 | awk '{print $1}'`; do docker push $item:stein; done
```

### 拉取镜像至各节点

```shell
$HOME/kolla-ansible/tools/kolla-ansible -i $HOME/multinode pull
```

## 各节点配置 ZUN Compute 容器（controller，compute1，compute2）

修改 `/etc/systemd/system/docker.service.d/kolla.conf`

将

```ini
ExecStart=/usr/bin/dockerd --insecure-registry controller:4000 --log-opt max-file=5 --log-opt max-size=50m
```

分别修改为

(controller)

```ini
ExecStart=/usr/bin/dockerd --insecure-registry controller:4000 --log-opt max-file=5 --log-opt max-size=50m -H tcp://controller:2375 -H unix:///var/run/docker.sock --cluster-store=etcd://controller:2379
```

(compute1)

```ini
ExecStart=/usr/bin/dockerd --insecure-registry controller:4000 --log-opt max-file=5 --log-opt max-size=50m -H tcp://compute1:2375 -H unix:///var/run/docker.sock --cluster-store=etcd://controller:2379
```

(compute2)

```ini
ExecStart=/usr/bin/dockerd --insecure-registry controller:4000 --log-opt max-file=5 --log-opt max-size=50m -H tcp://compute2:2375 -H unix:///var/run/docker.sock --cluster-store=etcd://controller:2379
```

重载 daemon，重启 docker （controller，compute1，compute2）

```shell
systemctl daemon-reload
systemctl restart docker
```

## Kolla Ansible Pre-Checks（controller）

```shell
$HOME/kolla-ansible/tools/kolla-ansible -i $HOME/multinode prechecks
```

## Kolla Ansible Deploy（controller）

```shell
$HOME/kolla-ansible/tools/kolla-ansible -i $HOME/multinode deploy
```

## Kolla Ansible Post Deploy（controller）

```shell
$HOME/kolla-ansible/tools/kolla-ansible -i $HOME/multinode post-deploy
```

## 初始化配置（controller）

### 安装 OpenStack 客户端（建议在虚拟环境进行）

```shell
pip install python-openstackclient
```

### 配置管理员环境

```shell
. /etc/kolla/admin-openrc.sh
```

### 拷贝初始化脚本

```shell
cp $HOME/kolla-ansible/tools/init-runonce $HOME/
```

### 配置初始化脚本 （./init-runonce）

```ini
EXT_NET_CIDR='10.0.2.0/24'
EXT_NET_RANGE='start=10.0.2.100,end=10.0.2.199'
EXT_NET_GATEWAY='10.0.2.2'
```

### 执行初始化脚本

```shell
. $HOME/init-runonce
```

### 配置 br-ex 桥接网卡 （/etc/network/interfaces）

```plain
auto br-ex
iface br-ex inet static
address 10.0.2.200
netmask 255.255.255.0
gateway 10.0.2.2
```

### 重启网络

```shell
netplan apply
```

## 额外配置（controller）

### Horizon 管理员环境

将 `admin-openrc.sh`，`prediction_train.csv`，`model.m` 拷贝至 horizon 容器并修改权限

```shell
docker cp /etc/kolla/admin-openrc.sh horizon:/etc/openstack-dashboard/
docker cp $HOME/prediction_train.csv horizon:/etc/openstack-dashboard/
docker cp $HOME/model.m horizon:/etc/openstack-dashboard/
```

```shell
docker exec horizon chown horizon:horizon /etc/openstack-dashboard/admin-openrc.sh
docker exec horizon chown horizon:horizon /etc/openstack-dashboard/prediction_train.csv
docker exec horizon chown horizon:horizon /etc/openstack-dashboard/model.m
```

重启 horizon 容器

```shell
docker restart horizon
```

### octavia 配置

创建 amphora 镜像（可在 <https://tarballs.openstack.org/octavia/test-images/> 下载）

```shell
openstack image create --disk-format qcow2 --file $HOME/test-only-amphora-x64-haproxy-ubuntu-bionic.qcow2 --tag amphora amphora
```

创建 octavia 安全组

```shell
openstack security group create --description 'Used by octavia amphora instance' octavia
```

为安全组添加规则

（`<security_group_id>` 通过 `openstack security group list` 获取）

```shell
openstack security group rule create --protocol icmp <security_group_id>
openstack security group rule create --protocol tcp --dst-port 5555 --egress <security_group_id>
openstack security group rule create --protocol tcp --dst-port 9443 --ingress <security_group_id>
```

添加密钥对

（`<octavia_keystone_password>` 通过 `grep octavia_keystone_password /etc/kolla/passwords.yml` 获取）

```shell
openstack keypair create --public-key $HOME/.ssh/id_rsa.pub octavia_ssh_key
openstack --os-username octavia --os-password <octavia_keystone_password> keypair create --public-key $HOME/.ssh/id_rsa.pub octavia_ssh_key
```

修改 `/etc/kolla/octavia-worker/octavia.conf`

（`<network_id>` 通过 `openstack network list` 获取，选择 public1 的 ID）

（`<flavor_id>` 通过 `openstack flavor list` 获取）

```ini
[controller_worker]
amp_boot_network_list = <network_id>
amp_image_tag = amphora
amp_secgroup_list = octavia
amp_flavor_id = <flavor_id>
amp_ssh_key_name = octavia_ssh_key
```

重启 octavia_worker 容器

```shell
docker restart octavia_worker
```
