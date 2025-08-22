FROM registry.cn-beijing.aliyuncs.com/yunionio/web-console-fe:v3.11-20250822 AS web-console
FROM registry.cn-beijing.aliyuncs.com/yunionio/web-base:v3.10.3-20240808.2

COPY ./dist /usr/share/nginx/html/web
COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY --from=web-console /usr/share/nginx/html/web-console /usr/share/nginx/html/web-console
