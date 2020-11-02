FROM registry.cn-beijing.aliyuncs.com/yunionio/web-base:v3.5.0

COPY ./dist /usr/share/nginx/html/web
COPY ./conf/nginx.conf /etc/nginx/conf.d/default.conf
