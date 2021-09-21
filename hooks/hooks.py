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
