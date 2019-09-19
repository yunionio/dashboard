FROM nginx

COPY ./dist /usr/share/nginx/html/web
COPY ./conf/nginx.conf /etc/nginx/conf.d/default.conf
