FROM registry.cn-beijing.aliyuncs.com/yunionio/web-console-fe:v4.0.0-20251112.0 AS web-console
# https://github.com/yunionio/container-images/blob/master/web-base/Makefile#L5
FROM registry.cn-beijing.aliyuncs.com/yunionio/web-base:v4.0.0-20251112.0

COPY ./dist /usr/share/nginx/html/web
COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY --from=web-console /usr/share/nginx/html/web-console /usr/share/nginx/html/web-console
