---
date: 2021-09-20
---

# 搭建一个静态博客网站

## 背景

其实一直都想搭建一个自己的博客网站，然后持续地输出一些技术相关的原创性文章，网站其实一直都在，但几乎没什么输出...

主要是觉得自己知道的可能也很片面、浅显，很多东西前人也已经探索过了，我写不出什么有价值的东西。但我心里还是不甘平凡呀，想创造出些什么，作为一枚程序员，博客或许是最好的方式了，我将尝试去找寻一些我认为有价值的切入点。

## 博客平台

现在的 (2021-09-20) 博客界面，其实是我用的第三种了，最开始用的是 [WordPress](https://wordpress.com/)，主题丰富、功能全面，但我实在不想碰 [PHP](https://www.php.net/)，后来也觉得博客不需要这么复杂；第二个用的是 [Jekyll](https://jekyllrb.com/)，这个也是 [Github Pages](https://pages.github.com/) 默认使用的平台，是用 [Ruby](https://www.ruby-lang.org/) (包管理器是 [Gem](https://rubygems.org/)，[好感](https://weibo.com/u/1705586121)++ 有木有) 写的，模板引擎是独有的 [Liquid](https://shopify.github.io/liquid/)，但基本与 [Jinja](https://jinja.palletsprojects.com/) (Jinja2?) 差不多，我有接触过 [Django](https://www.djangoproject.com/)，所以直到我尝试 hack Jekyll (不会 Ruby，这需求还不至于让我花时间去新学一门语言) 之前，都觉得它挺简单，也满足需求。

之后便去[寻找](https://jamstack.org/generators/) [Python](https://www.python.org/) & Jinja 的博客平台，找到了 [MkDocs](https://www.mkdocs.org/) 以及现在用的 [Material Design](https://squidfunk.github.io/mkdocs-material/) 主题，浏览了一遍官方文档，觉得基本能满足需求，便决定用它了。

## 自定义

先按照 [MkDocs](https://www.mkdocs.org/) 和 [Material Design](https://squidfunk.github.io/mkdocs-material/) 官方文档搭建起博客平台并选择自己需要启用的功能：数学公式、代码高亮等等 (我的刚需 hhhh)。

*下面只是按照我自己的喜好配置的* 0 0

### 配置文件

`mkdocs.yml`:
```yaml
site_name: Baitian's Blog
site_url: http://127.0.0.1:8000

theme:
  name: material
  custom_dir: overrides
  language: zh
  palette:
    - media: "(prefers-color-scheme: light)"
      scheme: default
      toggle:
        icon: material/weather-sunny
        name: 切换到深色主题
    - media: "(prefers-color-scheme: dark)"
      scheme: slate
      toggle:
        icon: material/weather-night
        name: 切换到浅色主题

markdown_extensions:
  - meta
  - pymdownx.highlight:
      linenums: true
  - pymdownx.inlinehilite
  - pymdownx.keys
  - pymdownx.superfences
  - admonition
  - abbr
  - pymdownx.snippets
  - pymdownx.arithmatex:
      generic: true
  - attr_list

plugins:
  - search
  - macros
  - mkdocs-simple-hooks:
      hooks:
        on_env: "hooks.hooks:on_env"

extra_css:
  - css/extra.css

extra_javascript:
  - js/extra.js
  - js/config.js
  - https://polyfill.io/v3/polyfill.min.js?features=es6
  - https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js
```

### 博客目录

首页按日期降序显示发表的博客：

1. 安装 [mkdocs-simple-hooks](https://github.com/aklajnert/mkdocs-simple-hooks)，为 Jinja 添加按日期降序排序所有博客的 [filter](https://jinja.palletsprojects.com/en/3.0.x/templates/#filters)  
`hooks/hooks.py`:
```py3
from typing import List

from jinja2.environment import Environment

from mkdocs.config.base import Config
from mkdocs.structure.files import Files
from mkdocs.structure.pages import Page
from mkdocs.structure.nav import Navigation


def filter_pages(nav: Navigation) -> List[Page]:
    pages = []
    for item in nav:
        if item.is_section:
            for sub_item in item.children:
                if sub_item.is_section:
                    pages.extend(filter_pages(sub_item))
                elif sub_item.meta.get('date') is not None and sub_item.url is not None:
                    pages.append(sub_item)
        elif item.meta.get('date') is not None and item.url is not None:
            pages.append(item)
    return sorted(pages, key=lambda page: page.meta.get('date'), reverse=True)


def on_env(env: Environment, config: Config, files: Files, **kwargs: dict) -> Environment:
    env.filters['pages'] = filter_pages
    return env
```

2. 修改 `index.md`，加上 index 标记  
`docs/index.md`:
```
---
index: true
title: Latest Posts
---

# Latest Posts
```

3. [覆盖](https://squidfunk.github.io/mkdocs-material/customization/#overriding-blocks-recommended) Material 原有的 `main.yml` (单独处理 `index.md`)  
`overrides/main.yml`:
```jinja
{% raw %}
{% extends "base.html" %}

{% block content %}

{% if page and page.meta and page.meta.index %}

<h1>{{ page.meta.title if page.meta.title else 'Latest Posts'}}</h1>
{% for item in nav|pages %}
{% if item.url %}
<p>
<div style="font-size: x-small; font-weight: lighter; color: darkgray;">{{ item.meta.date.strftime('%Y年%m月%d日') }}</div>
<a href="/{{ item.url }}">{{ item.title }}</a>
</p>
{% endif %}
{% endfor %}

{% else %}

{% if page.edit_url %}
<a href="{{ page.edit_url }}" title="{{ lang.t('edit.link.title') }}" class="md-content__button md-icon">
  {% include ".icons/material/pencil.svg" %}
</a>
{% endif %}
{% if not "\x3ch1" in page.content %}
<h1>{{ page.title | d(config.site_name, true)}}</h1>
{% endif %}
{{ page.content }}
{% if page and page.meta %}
{% if page.meta.git_revision_date_localized or
page.meta.revision_date
%}
{% include "partials/source-file.html" %}
{% endif %}
{% endif %}

{% endif %}

{% endblock %}
{% endraw %}
```

### 图片路径

安装 [mkdocs-simple-hooks](https://github.com/aklajnert/mkdocs-simple-hooks)，添加自定义宏处理图片路径  
`main.py`:
```py3
# This file is for mkdocs-macros

from mkdocs_macros.plugin import MacrosPlugin


def define_env(env: MacrosPlugin):

    @env.macro
    def image_path(img: str) -> str:
        return f'/img/{env.page.abs_url.strip("/")}/{img}'
```
比如：当前博客 Markdown 的路径为：`docs/test/setup-a-static-blog-site.md`，则图片的搜索路径为：`docs/img/test/setup-a-static-blog-site/`，插入图片的语法为：
```md
{% raw %}
![alt]({{ image_path('test.svg') }})
{% endraw %}
```

### 图片 [filter](https://developer.mozilla.org/en-US/docs/Web/CSS/filter)

实现图片颜色随主题变化，要求图片为透明背景，颜色为纯黑色

`docs/css/extra.css`:
```css
[data-md-color-scheme="default"] .md-content article p img[src$=".svg"] {
  filter: invert(9%) sepia(12%) saturate(0%) hue-rotate(182deg) brightness(87%) contrast(88%);
}

[data-md-color-scheme="slate"] .md-content article p img[src$=".svg"] {
  filter: invert(87%) sepia(20%) saturate(150%) hue-rotate(197deg) brightness(103%) contrast(98%);
}

[data-md-color-scheme="slate"] .md-content article p img[src$=".png"] {
  filter: invert(87%) sepia(20%) saturate(150%) hue-rotate(197deg) brightness(103%) contrast(98%);
}
```
上面的 filter 是在[这里](https://codepen.io/sosuke/pen/Pjoqqp)生成的，只选择了 SVG 图片和深色主题下的 PNG 图片，可以根据自己的需求修改 (由于压缩，位图可能存在黑色不纯的问题)。

![logo]({{ image_path('logo.svg') }})
{: style="margin: 0 auto; width: 40%;"}

*可以在顶部切换主题查看效果。*

## 部署

1. build  
```
mkdocs build
```
会在目录 `site/` 生成静态网站

2. 可以使用 rsync (Windows 可以考虑使用 [MSYS2](https://msys2.org/)) 拷贝至服务器上 (或者直接 push 到 [Github](https://github.com/)/[码云](https://gitee.com/))
```sh
rsync -v -r -l -p site/* <user>@<ip>:/var/www/html/blog
```

3. Nginx 配置  
`/etc/nginx/config.d/blog.conf`:
```nginx
server {
    listen   443 ssl;
    server_name blog.baitian.xyz;

    ssl_certificate         /etc/letsencrypt/live/blog.baitian.xyz/cert.pem;
    ssl_certificate_key     /etc/letsencrypt/live/blog.baitian.xyz/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/blog.baitian.xyz/fullchain.pem;

    location / {
        root    /var/www/html/blog;
    }
}
```
*数字证书可以使用 [Let's Encrypt](https://letsencrypt.org/) 生成 (国内域名备案可能比较麻烦...)。*

## 评论系统

由于 [Disqus](https://disqus.com/) 被墙，便去寻找其替代品，比较了许多 ([Isso](https://posativ.org/isso/), [畅言](http://changyan.kuaizhan.com/) 等等)，基本需求是加载速度要比较快、能够进行用户认证、界面风格与博客主题比较 match，最终选择了 [Remark42](https://github.com/umputun/remark42)。

1. 下载 [Remark42 release](https://github.com/umputun/remark42/releases) 版本

2. 使用 [systemd](https://www.freedesktop.org/wiki/Software/systemd/) 创建 Remark42 service  
`/etc/systemd/system/remark42.conf`
```ini
[Unit]
Description=Daemon to Start Remark42
Requires=network-online.target
After=network-online.target

[Service]
Type=simple
User=baitian
Group=baitian
Restart=always
RestartSec=10
ExecStart=/home/baitian/.local/opt/remark42/remark42.linux-amd64 \
    --url=https://remark42.baitian.xyz \
    --secret=<YOUR_SECRET> \
    server \
    --site=baitians-blog \
    --port=9080 \
    --smtp.username=baitian752@126.com \
    --smtp.password=<YOUR_AUTHORIZATION_CODE> \
    --smtp.host=smtp.126.com \
    --smtp.port=465 \
    --smtp.tls \
    --auth.email.enable \
    --auth.email.from=baitian752@126.com \
    --auth.email.subj="Confirmation from blog.baitian.xyz" \
    --auth.microsoft.cid=<YOUR_MS_CID> \
    --auth.microsoft.csec=<YOUR_MS_CSEC> \
    --auth.github.cid=<YOUR_GITHUB_CID> \
    --auth.github.csec=<YOUR_GITHUB_CSEC> \
    --auth.same-site=none \
    --emoji \
    --image.max-size=2097152 \
    --admin.shared.email=919600234@qq.com \
    --admin.shared.id=<YOUR_PRIVILEGED_ACCOUNTS> \
    --votes-ip-time=0s
WorkingDirectory=/home/baitian/.local/opt/remark42

[Install]
WantedBy=multi-user.target
```
*上述启动参数需要根据自己的实际环境修改，具体可参阅 Remark42 [官方文档](https://github.com/umputun/remark42)*。

3. 配置开机启动并立即启动
```sh
systemctl enable remark42.service
systemctl start remark42.service
```

4. Nginx 反向代理  
由于第三方 [OAuth](https://oauth.net/2/) 验证大都需要配置 HTTPS，所以考虑将 Remark42 启动到本地 IP，然后用 Nginx 进行反向代理，可以比较方便配置 HTTPS。  
`/etc/nginx/conf.d/remark42.conf`:
```nginx
server {
    listen   443 ssl;
    server_name remark42.baitian.xyz;

    if ($http_referer !~* ^https://(((blog)|(remark42).baitian.xyz)|(github.com)|(login.live.com))) {
        return 412;
    }

    ssl_certificate         /etc/letsencrypt/live/remark42.baitian.xyz/cert.pem;
    ssl_certificate_key     /etc/letsencrypt/live/remark42.baitian.xyz/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/remark42.baitian.xyz/fullchain.pem;

    add_header Strict-Transport-Security "max-age=63072000; includeSubdomains; preload";

    location / {
        proxy_redirect          off;
        proxy_set_header        X-Real-IP $remote_addr;
        proxy_set_header        X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header        Host $http_host;
        proxy_pass              http://127.0.0.1:9080;
    }
}
```
其中的 if 判断是为了检测域名，避免被别的网站使用，添加 github.com 和 login.live.com 是为了接入 Github 和 MicroSoft 账户登录。

5. 客户端接入  
`overrides/main.html` 最后**追加**:
```html
{% raw %}
{% block disqus %}
{% if page and page.meta and page.meta.index %}
{% else %}
<div id="remark42"></div>
{% endif %}
{% endblock %}
{% endraw %}
```
`docs/js/extra.js`:
```js
function syncRemark42Theme() {
    if (document.body.getAttribute('data-md-color-scheme') === 'default') {
        window.REMARK42.changeTheme('light')
    } else {
        window.REMARK42.changeTheme('dark')
    }
}

new MutationObserver(() => {
    syncRemark42Theme()
}).observe(document.body, {
    attributes: true
})

window.addEventListener('load', () => {
    window.remark_config = {
        host: "https://remark42.baitian.xyz",
        site_id: 'baitians-blog',
        components: ['embed'],
        max_shown_comments: 15,
        theme: document.body.getAttribute('data-md-color-scheme') === 'slate' ? 'dark' : 'light',
        locale: 'zh',
        show_email_subscription: true
    }

    !function (e, n) {
        for (var o = 0; o < e.length; o++) {
            var r = n.createElement("script"), c = ".js", d = n.head || n.body;
            r.id = 'remark42-module'
            "noModule" in r ? (r.type = "module", c = ".mjs") : r.async = !0, r.defer = !0, r.src = remark_config.host + "/web/" + e[o] + c, d.appendChild(r)
        }
    }(remark_config.components || ["embed"], document)
})
```
*在 Remark42 官方配置的基础上添加了与博客主题保持同步的功能*。

## 源码

- 码云: https://gitee.com/baitian752/blog/tree/setup/
- Github: https://github.com/baitian752/blog/tree/setup/
