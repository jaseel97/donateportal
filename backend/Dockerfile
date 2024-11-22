FROM python:3.12-alpine

RUN apk update
RUN apk add --no-cache binutils proj-util gdal postgresql-dev geos

WORKDIR /app
COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY . .

CMD ["sh", "/app/start.sh"]