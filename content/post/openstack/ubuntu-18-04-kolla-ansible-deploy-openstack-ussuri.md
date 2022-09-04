---
title: Ubuntu 18.04 通过 Kolla Ansible 部署 OpenStack Ussuri
description: 

date: 2020-11-10T00:00:00+08:00
lastmod: 2020-11-10T00:00:00+08:00

categories:
 - Work
tags:
 - OpenStack
 - Python
 - Shell

toc: true
---

## 安装 Ubuntu 18.04

安装两台 Ubuntu 18.04，其中一台至少配置两块网卡，另一台至少配置一块网卡。

说明：配置两块网卡的作为控制节点 ( `controller` )，一块网卡的作为计算节点 ( `compute` )。

## 准备工作 ( `controller`, `compute` )

### 配置 IP

`controller`

1. 设置控制节点 IP、网关变量

    ```shell
    LOCAL_GATEWAY=192.168.56.1
    LOCAL_ADDRESS=192.168.56.xxx
    ```

1. 设置计算节点 IP

    ```shell
    COMPUTE_ADDRESS=192.168.56.yyy
    ```

1. 设置网络接口名称变量
{{< note >}}
网络接口名称需要根据实际修改，可使用命令 `ip a` 查看网卡信息
{{< /note >}}

    ```shell
    NETWORK_INTERFACE1=eno1
    NETWORK_INTERFACE2=eno2
    ```

1. 配置接口 IP

    ```shell
    rm -r /etc/netplan/* && \
    tee /etc/netplan/controller.yaml <<- EOF
    network:
      version: 2
      renderer: networkd
      ethernets:
        $NETWORK_INTERFACE1:
          addresses: [$LOCAL_ADDRESS/24]
          gateway4: $LOCAL_GATEWAY
        $NETWORK_INTERFACE2:
          dhcp4: false
    EOF
    ```

`compute`

1. 设置 compute IP 及网关变量

    ```shell
    LOCAL_GATEWAY=192.168.56.1
    LOCAL_ADDRESS=192.168.56.yyy
    ```

1. 设置网络接口名称和 MAC 地址变量
{{< note >}}
`compute` 的网络接口名称必需与 `controller` 的一致，`NETWORK_INTERFACE` 为修改后的网络接口名称
{{< /note >}}

    ```shell
    NETWORK_INTERFACE=eno1
    NETWORK_INTERFACE_MAC=xx:yy:xx:yy:xx:yy
    ```

1. 可使用以下方法修改网络接口名称：

    - 新建规则

    ```shell
    tee /etc/udev/rules.d/70-persistent-net.rules <<- EOF
    SUBSYSTEM=="net", ACTION=="add", DRIVERS=="?*", ATTR{address}=="$NETWORK_INTERFACE_MAC", NAME="$NETWORK_INTERFACE"
    EOF
    ```

    - 修改 grub

    ```shell
    sed -i "s|GRUB_CMDLINE_LINUX=\"\"|GRUB_CMDLINE_LINUX=\"net.ifnames=1 biosdevname=0\"|g" /etc/default/grub
    ```

    - 更新 bootloader

    ```shell
    update-grub
    ```

    - 更新 initram

    ```shell
    update-initramfs -u
    ```

1. 配置接口 IP

    ```shell
    rm -r /etc/netplan/* && \
    tee /etc/netplan/compute.yaml <<- EOF
    network:
      version: 2
      renderer: networkd
      ethernets:
        $NETWORK_INTERFACE:
          addresses: [$LOCAL_ADDRESS/24]
          gateway4: $LOCAL_GATEWAY
    EOF
    ```

### 检查文件 ( `controller` )

```plain
/root
├── bionic-server-cloudimg-amd64.img
├── CentOS-7-x86_64-GenericCloud.qcow2.xz
├── cirros-0.5.1-x86_64-disk.img
├── create_dual_intermediate_CA.sh
├── images
│   ├── registry.tar
│   ├── ubuntu.tar
│   ├── ubuntu-source-aodh-api.tar
│   ├── ubuntu-source-aodh-evaluator.tar
│   ├── ubuntu-source-aodh-listener.tar
│   ├── ubuntu-source-aodh-notifier.tar
│   ├── ubuntu-source-ceilometer-central.tar
│   ├── ubuntu-source-ceilometer-compute.tar
│   ├── ubuntu-source-ceilometer-notification.tar
│   ├── ubuntu-source-chrony.tar
│   ├── ubuntu-source-cinder-api.tar
│   ├── ubuntu-source-cinder-backup.tar
│   ├── ubuntu-source-cinder-scheduler.tar
│   ├── ubuntu-source-cinder-volume.tar
│   ├── ubuntu-source-cron.tar
│   ├── ubuntu-source-etcd.tar
│   ├── ubuntu-source-fluentd.tar
│   ├── ubuntu-source-glance-api.tar
│   ├── ubuntu-source-gnocchi-api.tar
│   ├── ubuntu-source-gnocchi-metricd.tar
│   ├── ubuntu-source-heat-api-cfn.tar
│   ├── ubuntu-source-heat-api.tar
│   ├── ubuntu-source-heat-engine.tar
│   ├── ubuntu-source-horizon.tar
│   ├── ubuntu-source-iscsid.tar
│   ├── ubuntu-source-keystone-fernet.tar
│   ├── ubuntu-source-keystone-ssh.tar
│   ├── ubuntu-source-keystone.tar
│   ├── ubuntu-source-kolla-toolbox.tar
│   ├── ubuntu-source-kuryr-libnetwork.tar
│   ├── ubuntu-source-mariadb-clustercheck.tar
│   ├── ubuntu-source-mariadb.tar
│   ├── ubuntu-source-memcached.tar
│   ├── ubuntu-source-neutron-dhcp-agent.tar
│   ├── ubuntu-source-neutron-l3-agent.tar
│   ├── ubuntu-source-neutron-metadata-agent.tar
│   ├── ubuntu-source-neutron-openvswitch-agent.tar
│   ├── ubuntu-source-neutron-server.tar
│   ├── ubuntu-source-nova-api.tar
│   ├── ubuntu-source-nova-compute.tar
│   ├── ubuntu-source-nova-conductor.tar
│   ├── ubuntu-source-nova-libvirt.tar
│   ├── ubuntu-source-nova-novncproxy.tar
│   ├── ubuntu-source-nova-scheduler.tar
│   ├── ubuntu-source-nova-ssh.tar
│   ├── ubuntu-source-octavia-api.tar
│   ├── ubuntu-source-octavia-health-manager.tar
│   ├── ubuntu-source-octavia-housekeeping.tar
│   ├── ubuntu-source-octavia-worker.tar
│   ├── ubuntu-source-openvswitch-db-server.tar
│   ├── ubuntu-source-openvswitch-vswitchd.tar
│   ├── ubuntu-source-panko-api.tar
│   ├── ubuntu-source-placement-api.tar
│   ├── ubuntu-source-rabbitmq.tar
│   ├── ubuntu-source-tgtd.tar
│   ├── ubuntu-source-titan-api.tar
│   ├── ubuntu-source-titan-scaling.tar
│   ├── ubuntu-source-titan-scheduler.tar
│   ├── ubuntu-source-zun-api.tar
│   ├── ubuntu-source-zun-cni-daemon.tar
│   ├── ubuntu-source-zun-compute.tar
│   └── ubuntu-source-zun-wsproxy.tar
├── init-runonce
├── kolla-ansible.tar.gz
├── multinode
├── openssl.cnf
├── prediction_train.csv
├── python-titanclient.tar.gz
├── test-only-amphora-x64-haproxy-ubuntu-bionic.qcow2
├── trusted.gpg
└── Windows 2016 Server.qcow.gz
```

### 配置自定义源 IP 及端口

```shell
CUSTOM_MIRROR_HOST=192.168.56.zzz
CUSTOM_MIRROR_PORT=81
```

### 配置 `apt` 源

```shell
tee /etc/apt/sources.list <<- EOF
deb http://$CUSTOM_MIRROR_HOST:$CUSTOM_MIRROR_PORT/ubuntu/ bionic main restricted universe multiverse
deb-src http://$CUSTOM_MIRROR_HOST:$CUSTOM_MIRROR_PORT/ubuntu/ bionic main restricted universe multiverse

deb http://$CUSTOM_MIRROR_HOST:$CUSTOM_MIRROR_PORT/ubuntu/ bionic-security main restricted universe multiverse
deb-src http://$CUSTOM_MIRROR_HOST:$CUSTOM_MIRROR_PORT/ubuntu/ bionic-security main restricted universe multiverse

deb http://$CUSTOM_MIRROR_HOST:$CUSTOM_MIRROR_PORT/ubuntu/ bionic-updates main restricted universe multiverse
deb-src http://$CUSTOM_MIRROR_HOST:$CUSTOM_MIRROR_PORT/ubuntu/ bionic-updates main restricted universe multiverse

deb http://$CUSTOM_MIRROR_HOST:$CUSTOM_MIRROR_PORT/ubuntu/ bionic-proposed main restricted universe multiverse
deb-src http://$CUSTOM_MIRROR_HOST:$CUSTOM_MIRROR_PORT/ubuntu/ bionic-proposed main restricted universe multiverse

deb http://$CUSTOM_MIRROR_HOST:$CUSTOM_MIRROR_PORT/ubuntu/ bionic-backports main restricted universe multiverse
deb-src http://$CUSTOM_MIRROR_HOST:$CUSTOM_MIRROR_PORT/ubuntu/ bionic-backports main restricted universe multiverse

deb [arch=amd64 trusted=yes] http://$CUSTOM_MIRROR_HOST:$CUSTOM_MIRROR_PORT/docker-ce/linux/ubuntu/ bionic stable
# deb-src [arch=amd64 trusted=yes] http://$CUSTOM_MIRROR_HOST:$CUSTOM_MIRROR_PORT/docker-ce/linux/ubuntu/ bionic stable
EOF
```

### 配置 `pip` 源

```shell
mkdir -p $HOME/.config/pip && tee $HOME/.config/pip/pip.conf <<- EOF
[global]
index-url = http://$CUSTOM_MIRROR_HOST:$CUSTOM_MIRROR_PORT/pypi/simple/
trusted-host = $CUSTOM_MIRROR_HOST
EOF
```

### 复制 GPG 公钥

```shell
cp $HOME/trusted.gpg /etc/apt/trusted.gpg
```

### 更新 `apt` 索引

```shell
apt update
```

### 安装 `pip`

```shell
apt install python3-pip -y
```

### 安装并创建、激活 `python` 虚拟环境、更新 `pip`

```shell
apt install python3-venv -y && \
python3 -m venv --system-site-packages $HOME/venv && \
. $HOME/venv/bin/activate && \
pip install -U pip
```

### `pip` 安装 `wheel` ( 避免后续 build 时报错 )

```shell
pip install wheel
```

### 安装 `docker`

```shell
apt install docker-ce -y
```

## 安装部署工具 ( `controller` )

### 安装依赖

```shell
apt install python3-apt python3-dev libffi-dev gcc libssl-dev curl git lvm2 -y
```

### 安装 `ansible`

```shell
pip install -U 'ansible<2.10'
```

### 安装 `kolla ansible`

```shell
tar zxvf $HOME/kolla-ansible.tar.gz -C $HOME && \
pip install -U -r $HOME/kolla-ansible/requirements.txt && \
pip install -U $HOME/kolla-ansible && \
rm -r $HOME/kolla-ansible
```

### 安装 `OpenStack` 客户端

```shell
pip install python-openstackclient
```

## 配置 `kolla ansible` ( `controller` )

### 拷贝全局配置和密码配置文件

```shell
cp -r $HOME/venv/share/kolla-ansible/etc_examples/kolla /etc/
```

### 设置 `INVENTORY` 变量

```shell
INVENTORY=multinode
```

### 配置 `inventory`

{{< note >}}
*`storage` 为配置了 cinder 空闲卷的主机
{{< /note >}}

```shell
tee $HOME/multinode_temp <<- EOF
[control]
$LOCAL_ADDRESS

[network]
$LOCAL_ADDRESS

[compute]
$LOCAL_ADDRESS
$COMPUTE_ADDRESS

[monitoring]
$LOCAL_ADDRESS

[storage]
$COMPUTE_ADDRESS
EOF

cat multinode >> multinode_temp && \
mv multinode_temp multinode
```

### 生成随机密码

```shell
kolla-genpwd
```

### 修改全局配置文件

```shell
tee -a /etc/kolla/globals.yml <<- EOF
kolla_dev_repos_git: "http://git.trystack.cn/openstack"
config_strategy: "COPY_ALWAYS"

kolla_base_distro: "ubuntu"
kolla_install_type: "source"
openstack_release: "ussuri"

kolla_internal_vip_address: "$LOCAL_ADDRESS"
network_interface: "$NETWORK_INTERFACE1"
neutron_external_interface: "$NETWORK_INTERFACE2"

node_custom_config: "/etc/kolla/config"

enable_haproxy: "no"
enable_cinder: "yes"
enable_cinder_backend_lvm: "yes"
enable_etcd: "yes"
enable_kuryr: "yes"
enable_zun: "yes"
docker_configure_for_zun: "yes"
containerd_configure_for_zun: "yes"

enable_aodh: "yes"
enable_gnocchi: "yes"
enable_panko: "yes"
enable_ceilometer: "yes"

enable_octavia: "yes"

enable_titan: "yes"

# nova_compute_virt_type: "qemu" # Must set this when deploying in virtual machines

docker_registry: "$LOCAL_ADDRESS:4000"

custom_docker_host: "$CUSTOM_MIRROR_HOST"
custom_docker_port: "$CUSTOM_MIRROR_PORT"
EOF
```

### 配置 `cinder-volumes` ( `inventory` 中的 `storage` 节点 )

{{< note >}}
这里假设空闲分区为 `/dev/sdb`
{{< /note >}}

```shell
free_device=/dev/sdb && \
pvcreate $free_device && \
vgcreate cinder-volumes $free_device
```

### 配置 `SSH` 密钥登录各节点，并确认主机指纹验证

生成 SSH 密钥对

{{< note >}}
输入以下命令后一直回车即可
{{< /note >}}

```shell
ssh-keygen
```

将生成的 `$HOME/.ssh/id_rsa.pub` 文件内容拷贝至所有节点的 `/root/.ssh/authorized_keys` 文件并修改文件权限：

`(controller, compute)`

```shell
chmod 644 /root/.ssh/authorized_keys
```

### 测试多节点配置

{{< note >}}
第一次连接的话需要手动输入 `yes` 进行确认
{{< /note >}}

```shell
ansible -i $HOME/$INVENTORY all -m ping
```

### 设置 `ansible` 的 `python` 解释器

```shell
tee $HOME/.ansible.cfg <<- EOF
[defaults]
interpreter_python=$HOME/venv/bin/python
EOF
```

### 额外配置

1. 拷贝故障预测数据

    ```shell
    mkdir -p /etc/kolla/config/horizon && \
    cp $HOME/prediction_train.csv /etc/kolla/config/horizon/
    ```

1. 创建 `zun-cni` 目录

    ```shell
    mkdir -p /opt/cni/bin/
    ```

1. nova compute monitors

    ```shell
    mkdir -p /etc/kolla/config/nova && \
    tee /etc/kolla/config/nova/nova.conf <<- EOF
    [DEFAULT]
    compute_monitors = cpu.virt_driver
    EOF
    ```

1. octavia 配置 SSL 证书
{{< note >}}
`pass` 表示不用执行任何命令
{{< /note >}}

    - 获取创建证书脚本

    ```plain
    pass
    ```
    <!-- ```shell
    curl http://git.trystack.cn/cgit/openstack/octavia/plain/bin/create_dual_intermediate_CA.sh?h=stable/ussuri |
    sed 's/echo ".*//g' |
    sed 's/not-secure-passphrase/$OCTAVIA_PASS/g' > \
    $HOME/create_dual_intermediate_CA.sh &&
    chmod +x $HOME/create_dual_intermediate_CA.sh
    ``` -->

    - 获取 SSL 配置文件

    ```plain
    pass
    ```
    <!-- ```shell
    curl -o $HOME/openssl.cnf http://git.trystack.cn/cgit/openstack/octavia/plain/bin/openssl.cnf?h=stable/ussuri
    ``` -->

    - 生成 SSL 证书

    ```shell
    export OCTAVIA_PASS=`awk '/^octavia_ca_password:/ {print $2}' /etc/kolla/passwords.yml`
    bash $HOME/create_dual_intermediate_CA.sh
    ```

    - 拷贝 SSL 证书

    ```shell
    mkdir -p /etc/kolla/config/octavia
    cp $HOME/dual_ca/etc/octavia/certs/* /etc/kolla/config/octavia/
    ```

## 获取 `kolla` 镜像(`controller`)

<!-- **可配置 Docker 仓库代理，如下：**

在 `/etc/docker/daemon.json` 中添加

```
{
  "registry-mirrors": ["https://docker.mirrors.sjtug.sjtu.edu.cn"]
}
```

重载 daemon，重启 docker

```shell
systemctl daemon-reload
systemctl restart docker
``` -->

<!-- ### 方式1，从 Docker Hub 拉取 -->

<!-- ```shell
kolla-ansible pull -vvv
``` -->

<!-- ### 方式2，本地 tar 导入 -->

### 导入本地镜像

```shell
cd $HOME/images && \
for item in `ls`; do docker load -i $item; done && \
cd $HOME
```

### 修改 ubuntu、registry、horizon 镜像 tag（如有必要）

```shell
docker tag d70eaf7277ea ubuntu:latest
docker tag 2d4f4b5309b1 registry:latest
docker tag 84ced3da8f79 kolla/ubuntu-source-horizon:ussuri
```

### 搭建本地 registry 服务器

```shell
docker run -d --name registry --restart=always -p 4000:5000 -v /opt/registry:/var/lib/registry registry
```

### 修改镜像 tag

```shell
for item in `docker images | awk '/ ussuri / {print $1}'`; do \
docker image tag $item:ussuri $LOCAL_ADDRESS:4000/$item:ussuri; \
done
```

## 部署 (`controller`)

### Kolla Ansible Bootstrap Servers

```shell
kolla-ansible -i $HOME/$INVENTORY bootstrap-servers
```

### 上传镜像至本地 registry 服务器

```shell
for item in $(docker images | awk "/$LOCAL_ADDRESS:4000/ {print \$1}"); do docker push $item:ussuri; done
```

### Kolla Ansible Pre-Checks

```shell
kolla-ansible -i $HOME/$INVENTORY prechecks
```

### Kolla Ansible Deploy

```shell
kolla-ansible -i $HOME/$INVENTORY deploy
```

### Kolla Ansible Post Deploy

```shell
kolla-ansible -i $HOME/$INVENTORY post-deploy
```

## 配置 (`controller`)

### 配置管理员环境

```shell
. /etc/kolla/admin-openrc.sh
```

### 配置初始化脚本

`$HOME/init-runonce`

{{< note >}}
请根据实际 IP 信息修改下列 IP / 网段
{{< /note >}}

```ini
EXT_NET_CIDR=${EXT_NET_CIDR:-'192.168.56.0/24'}
EXT_NET_RANGE=${EXT_NET_RANGE:-'start=192.168.56.221,end=192.168.56.230'}
EXT_NET_GATEWAY=${EXT_NET_GATEWAY:-'192.168.56.1'}
```

### 执行初始化脚本

```shell
bash $HOME/init-runonce
```

<!-- ### 配置 br-ex 桥接网卡

`$HOME/01-br-ex.yaml`

```
network:
  bridges:
    br-ex:
      interfaces:
        - enp0s8
      addresses:
        - 192.168.56.bbb/24
      gateway4: 192.168.56.1
  version: 2
```

### 应用配置

```shell
. $HOME/update-br-ex.sh
``` -->

## 额外配置 (`controller`)

<!-- ### 已全部集成在了初始化脚本中，部署到此为止 -->

### 设置环境变量

```shell
KOLLA_OPENSTACK_COMMAND=openstack
ADMIN_USER_ID=$($KOLLA_OPENSTACK_COMMAND user list | awk '/ admin / {print $2}')
ADMIN_PROJECT_ID=$($KOLLA_OPENSTACK_COMMAND project list | awk '/ admin / {print $2}')
ADMIN_SEC_GROUP=$($KOLLA_OPENSTACK_COMMAND security group list --project ${ADMIN_PROJECT_ID} | awk '/ default / {print $2}')
ADMIN_DOMAIN_ID=$($KOLLA_OPENSTACK_COMMAND domain show Default | awk '/ id / {print $4}')
```

### 设置 admin domain ID

```shell
tee -a /etc/kolla/admin-openrc.sh <<- EOF
export OS_USER_DOMAIN_ID=$ADMIN_DOMAIN_ID
EOF
```

### root 用户配置

1. 获取 root 用户密码

    ```shell
    ROOT_PASS=$(awk '/^root_user_password:/ {print $2}' /etc/kolla/passwords.yml)
    ```

1. 创建 root 用户

    ```shell
    $KOLLA_OPENSTACK_COMMAND user create --domain $ADMIN_DOMAIN_ID --project-domain $ADMIN_PROJECT_ID --password $ROOT_PASS root
    ```

1. 修改 root 角色

    ```shell
    $KOLLA_OPENSTACK_COMMAND role add --system all --user root admin
    $KOLLA_OPENSTACK_COMMAND role add --project admin --user root heat_stack_owner
    $KOLLA_OPENSTACK_COMMAND role add --project admin --user root admin
    ```

1. 使用 root 用户

    ```shell
    export OS_USERNAME=root
    export OS_PASSWORD=$ROOT_PASS
    ```

1. 添加 root 用户密钥对

    ```shell
    $KOLLA_OPENSTACK_COMMAND keypair create --public-key $HOME/.ssh/id_rsa.pub mykey
    ```

### 重启 titan 容器

```shell
docker restart titan_api titan_scheduler titan_scaling
```

### `octavia` 配置

1. 获取 Network ID

    ```shell
    NETWORK_ID=$($KOLLA_OPENSTACK_COMMAND network list | awk '/ public1 / {print $2}')
    ```

1. 设置 Flavor ID

    ```shell
    FLAVOR_ID=2
    ```

1. 修改 Octavia Worker 配置

    ```shell
    sed -i "s|amp_boot_network_list =.*|amp_boot_network_list = $NETWORK_ID|g" /etc/kolla/octavia-worker/octavia.conf
    sed -i "s|amp_secgroup_list =.*|amp_secgroup_list = octavia|g" /etc/kolla/octavia-worker/octavia.conf
    sed -i "s|amp_flavor_id =.*|amp_flavor_id = $FLAVOR_ID|g" /etc/kolla/octavia-worker/octavia.conf
    ```

1. 创建 `amphora` 镜像

    <!-- （可在 https://tarballs.openstack.org/octavia/test-images/ 下载） -->

    ```shell
    $KOLLA_OPENSTACK_COMMAND image create --public --disk-format qcow2 --file test-only-amphora-x64-haproxy-ubuntu-bionic.qcow2 --tag amphora amphora
    ```

1. 获取 Octavia 密码

    ```shell
    OCTAVIA_KEYSTONE_PASSWORD=$(awk '/^octavia_keystone_password:/ {print $2}' /etc/kolla/passwords.yml)
    ```

1. 使用 Octavia 用户

    ```shell
    export OS_USERNAME=octavia
    export OS_PASSWORD=$OCTAVIA_KEYSTONE_PASSWORD
    export OS_PROJECT_NAME=service
    export OS_TENANT_NAME=service
    ```

1. 创建 `octavia` 安全组

    ```shell
    $KOLLA_OPENSTACK_COMMAND security group create --description 'Used by octavia amphora instance' octavia
    ```

1. 为安全组添加规则

    ```shell
    SECURITY_GROUP_ID=$($KOLLA_OPENSTACK_COMMAND security group list | awk '/ octavia / {print $2}')
    $KOLLA_OPENSTACK_COMMAND security group rule create --protocol icmp $SECURITY_GROUP_ID
    $KOLLA_OPENSTACK_COMMAND security group rule create --protocol tcp --dst-port 22 --egress $SECURITY_GROUP_ID
    $KOLLA_OPENSTACK_COMMAND security group rule create --protocol tcp --dst-port 9443 --ingress $SECURITY_GROUP_ID
    ```

1. 添加密钥对

    ```shell
    $KOLLA_OPENSTACK_COMMAND keypair create --public-key $HOME/.ssh/id_rsa.pub octavia_ssh_key
    ```

1. 重启 Octavia Worker 容器

    ```shell
    docker restart octavia_worker
    ```
