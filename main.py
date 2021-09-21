# This file is for mkdocs-macros

from mkdocs_macros.plugin import MacrosPlugin


def define_env(env: MacrosPlugin):

    @env.macro
    def image_path(img: str) -> str:
        return f'/img/{env.page.abs_url.strip("/")}/{img}'
