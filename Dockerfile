FROM registry.cn-beijing.aliyuncs.com/yunionio/web-base:latest

COPY ./dist /usr/share/nginx/html/web
COPY ./conf/nginx.conf /etc/nginx/conf.d/default.conf
