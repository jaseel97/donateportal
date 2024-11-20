#!/bin/sh
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser --noinput || echo "Superuser already exists, skipping creation."

exec gunicorn --workers "${GUNICORN_WORKERS}" --bind "0.0.0.0:${API_PORT}" djangotango.asgi:application -k uvicorn.workers.UvicornWorker