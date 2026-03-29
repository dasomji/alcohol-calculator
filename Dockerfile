FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html forteachers.html ./
COPY src ./src
COPY assets ./assets
COPY images ./images

EXPOSE 80
