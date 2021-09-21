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
