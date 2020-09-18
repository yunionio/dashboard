FROM registry.cn-beijing.aliyuncs.com/yunionio/web-base:v3.4.1

COPY ./dist /usr/share/nginx/html/web
COPY ./conf/nginx.conf /etc/nginx/conf.d/default.conf
