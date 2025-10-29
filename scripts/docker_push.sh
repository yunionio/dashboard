#!/bin/bash
set -o errexit
set -o pipefail

if [ "$DEBUG" == "true" ]; then
    set -ex ;export PS4='+(${BASH_SOURCE}:${LINENO}): ${FUNCNAME[0]:+${FUNCNAME[0]}(): }'
fi

pushd $(dirname $(dirname "$BASH_SOURCE")) > /dev/null
CUR_DIR=$(pwd)
SRC_DIR=$CUR_DIR
popd > /dev/null

DOCKER_DIR="$SRC_DIR"

get_current_arch() {
    local current_arch
    case $(uname -m) in
        x86_64)
            current_arch=amd64
            ;;
        aarch64)
            current_arch=arm64
            ;;
    esac
    echo $current_arch
}

CURRENT_ARCH=$(get_current_arch)
ARCH=${ARCH:-$CURRENT_ARCH}

REGISTRY=${REGISTRY:-registry.cn-beijing.aliyuncs.com/yunionio}
TAG=${TAG:-latest}

build_src() {
    docker run --rm \
        -v $SRC_DIR:/app \
        -e OEM_VERSION=$OEM_VERSION \
        -e VUE_APP_OEM_VERSION=$VUE_APP_OEM_VERSION \
        registry.cn-beijing.aliyuncs.com/swordqiu/node:20-alpine-git \
        /bin/sh -c "set -ex;
	git config --global --add safe.directory /app;
    cd /app;
    yarn cache clean
    rm -fr node_modules
    yarn install;
    yarn run build;
    chown -R $(id -u):$(id -g) dist node_modules;
    "
}


buildx_and_push() {
    local tag=$1
    local file=$2
    local path=$3
    local arch=$4
    docker buildx build -t "$tag" --platform "linux/$arch" -f "$2" "$3" --push
    docker pull --platform "linux/$arch" "$tag"
}

make_manifest_image() {
    local img_name=$1
    docker buildx imagetools create -t $img_name \
        $img_name-amd64 \
        $img_name-arm64
}

# 如果 ENV="local"，跳过 build_src
if [[ "$ENV" != "local" ]]; then
    build_src
fi

if [[ "$DRY_RUN" == "true" ]]; then
    echo "[$(readlink -f ${BASH_SOURCE}):${LINENO} ${FUNCNAME[0]}] return for DRY_RUN"
    exit 0
fi

img_name="$REGISTRY/web:$TAG"

set -x

case $ARCH in
    amd64 | "arm64" )
        buildx_and_push "$img_name" "$DOCKER_DIR/Dockerfile" "$SRC_DIR" "$ARCH"
        echo "更新命令："
        echo "kubectl patch oc -n onecloud default --type='json' -p='[{op: replace, path: /spec/web/imageName, value: web-ee},{"op": "replace", "path": "/spec/web/repository", "value": "${REGISTRY}"},{"op": "add", "path": "/spec/web/tag", "value": "${TAG}"}]'"
        ;;
    *)
        for arch in "arm64" "amd64"; do
            buildx_and_push "$img_name-$arch" "$DOCKER_DIR/Dockerfile" "$SRC_DIR" "$arch"
        done
        make_manifest_image $img_name
        echo "更新命令："
        echo "kubectl patch oc -n onecloud default --type='json' -p='[{op: replace, path: /spec/web/imageName, value: web-ee},{"op": "replace", "path": "/spec/web/repository", "value": "${REGISTRY}"},{"op": "add", "path": "/spec/web/tag", "value": "${TAG}"}]'"
        ;;
esac

# 输出当前web-console版本信息
if [ "$ENV" == "local" ]; then
    WEB_CONSOLE_VERSION=$(grep -o 'web-console-fe:v[^[:space:]]*' Dockerfile | head -1 | sed 's/web-console-fe://')
    echo "当前web-console版本为: ${WEB_CONSOLE_VERSION}"
    echo "请注意检查web-console环境兼容性！"
fi

