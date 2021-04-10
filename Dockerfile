# web-base:v3.6.0 是 能够兼容 arm64 的版本
FROM registry.cn-beijing.aliyuncs.com/yunionio/web-base:v3.6.0

COPY ./dist /usr/share/nginx/html/web
COPY ./conf/nginx.conf /etc/nginx/nginx.conf
