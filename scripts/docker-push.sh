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

REGISTRY=${REGISTRY:-registry.cn-beijing.aliyuncs.com/yunionio}
TAG=${TAG:-latest}

build_src() {
    yarn install
    ./scripts/setup.sh
    yarn run build
}

build_image() {
    local tag=$1
    local file=$2
    local path=$3
    docker build -t "$tag" -f "$file" "$path"
}

push_image() {
    local tag=$1
    docker push "$tag"
}

docker_buildx(){
    local tag=$1
    local file=$2
    local path=$3
    tag=${tag}-arm64
    docker buildx build --platform="linux/$ARCH" -t "$tag" -f "$file" "$path" --push
    docker pull $tag
}

build_src
img_name="$REGISTRY/web:$TAG"

case $ARCH in
    amd64 | "" )
        build_image "$img_name" "$DOCKER_DIR/Dockerfile" "$SRC_DIR"
        push_image "$img_name"
        ;;
    arm64)
        docker_buildx "$img_name" "$DOCKER_DIR/Dockerfile" "$SRC_DIR"
        ;;
esac

