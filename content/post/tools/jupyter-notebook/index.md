---
title: Jupyter Notebook
description: 

date: 2022-09-04T15:27:56+08:00
lastmod: 2022-09-04T15:27:56+08:00

categories:
 - Tool
tags:
 - Jupyter
 - Notebook

toc: true
---

写这篇博客的目的，大概是身边很多人都认为 [Jupyter Notebook](https://jupyter.org/) 是 Python 专属的，但其实 Jupyter 是支持很多其他 [kernel](https://github.com/jupyter/jupyter/wiki/Jupyter-kernels) 的，在学习一门新的语言、或是对于一些新的语言特性不确定的时候，用 Jupyter 来测试会十分方便，尤其是对于像 C++、Go、Rust 这种编译型语言。

![jupyter-example](jupyter-example.webp)

## 部署流程

{{< note warning >}}
出于安全性考虑，请不要使用 root 用户运行 Jupyter，因为 Jupyter 默认是开启 Terminal 的，即使关掉，通过编程语言的接口，也可以直接对系统进行操作。该流程在容器中部署，同时用非 root 用户运行，提供了一定的安全保障。
{{< /note >}}

### Dockerfile

{{< note >}}
下面的 Dockerfile 会装 C++, Go, Rust 这 3 个 kernel，可以参考官方 [wiki](https://github.com/jupyter/jupyter/wiki/Jupyter-kernels) 装其他 kernel。如果 Host 系统不是 x86_64 架构的，Miniconda 和 Go 需要下载对应架构的 release（可能会踩一些坑 :rofl:）。
{{< /note >}}

```dockerfile
FROM debian:bullseye-slim

ARG USER=notebook
ARG HOME=/home/${USER}

RUN adduser --disabled-password --gecos "" --home ${HOME} ${USER}

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive && \
    apt-get install -y --no-install-recommends ca-certificates curl wget cmake build-essential && \
    rm -rf /var/lib/apt/lists/*

USER ${USER}

# install miniconda
ENV PATH=${HOME}/miniconda3/bin:${PATH}
RUN cd ${HOME} && \
    wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh && \
    bash Miniconda3-latest-Linux-x86_64.sh -b && \
    rm -f Miniconda3-latest-Linux-x86_64.sh

# install jupyter
RUN conda install -y jupyter

# install C++ kernel
RUN conda install -y xeus-cling -c conda-forge

# clean conda cache
RUN conda clean --all

# install go kernel
ENV PATH=${HOME}/go/bin:${PATH}
RUN wget -qO- https://go.dev/dl/go1.19.linux-amd64.tar.gz | tar zxvf - -C ${HOME}
RUN go install github.com/gopherdata/gophernotes@v0.7.5 && \
    mkdir -p ${HOME}/.local/share/jupyter/kernels/gophernotes && \
    cd ${HOME}/.local/share/jupyter/kernels/gophernotes && \
    cp "$(go env GOPATH)"/pkg/mod/github.com/gopherdata/gophernotes@v0.7.5/kernel/*  ./ && \
    chmod +w kernel.json && \
    sed "s|gophernotes|$(go env GOPATH)/bin/gophernotes|" < kernel.json.in > kernel.json

# install rust kernel
ENV PATH=${HOME}/.cargo/bin:${PATH}
RUN cd ${HOME} && \
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs > rustup-init.sh && \
    bash rustup-init.sh -y && \
    rm -f rustup-init.sh
RUN rustup component add rust-src && \
    cargo install evcxr_jupyter && \
    evcxr_jupyter --install

RUN mkdir -p ${HOME}/notebook
WORKDIR ${HOME}/notebook

ENTRYPOINT [ "jupyter", "notebook", "--ip='*'", "--port=8888" ]
```

### 构建 docker 镜像

```shell
docker build -t notebook .
```

### 运行容器

```shell
docker run -d -p 8888:8888 --restart always --name notebook notebook
```

### 设置访问密码

```shell
docker exec -it notebook jupyter notebook password
```

### 重启容器

```shell
docker restart notebook
```

{{< note >}}
重置密码的流程也是 [设置访问密码](#设置访问密码) 后 [重启容器](#重启容器)。
{{< /note >}}
