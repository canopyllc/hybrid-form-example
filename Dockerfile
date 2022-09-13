FROM python:3.10


ENV \
    # This prevents Python from writing out pyc files \
    PYTHONDONTWRITEBYTECODE=1 \
    # This keeps Python from buffering stdin/stdout \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/code

WORKDIR /code

# build-essential - C compiler for building packages like uwsgi
# python-dev - Needed for building C extensions for CPython
# libffi-dev - Needed for crytography packages like bcrypt
RUN apt update \
    && apt install -y build-essential python-dev libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
COPY requirements-dev.txt ./

RUN set -ex \
    && pip install --upgrade pip \
    && pip install pip-tools --upgrade \
    && pip install -r /code/requirements-dev.txt \
    && cp /etc/skel/.bashrc /root/.bashrc
