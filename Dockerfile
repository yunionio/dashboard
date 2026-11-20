FROM registry.cn-beijing.aliyuncs.com/yunionio/web-console-fe:v3.11-20260312 AS web-console
FROM registry.cn-beijing.aliyuncs.com/yunionio/web-base:v4.0.0-20261120.0

COPY ./dist /usr/share/nginx/html/web
COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY --from=web-console /usr/share/nginx/html/web-console /usr/share/nginx/html/web-console
