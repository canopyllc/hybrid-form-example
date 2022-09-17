#!/usr/bin/env python

import random
from pathlib import Path

ENV_TEMPLATE = (
    "DEBUG=on\n"
    "SECRET_KEY={secret_key}\n"
    "DATABASE_URL=mysql://hybrid_form:{mysql_password}@db:3306/hybrid_form\n"
    "MYSQL_PASSWORD={mysql_password}\n"
    "MYSQL_ROOT_PASSWORD={mysql_root_password}\n"
)


def get_random_password(length):
    return "".join(random.sample("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", length))


env_file_path = Path(__file__).parent.parent.joinpath('.env')
if env_file_path.is_file() is False:
    env_text = ENV_TEMPLATE.format(**{
        "mysql_password": get_random_password(18),
        "mysql_root_password": get_random_password(18),
        "secret_key": get_random_password(50),
    })
    with open(env_file_path, 'w') as f:
        f.write(env_text)
