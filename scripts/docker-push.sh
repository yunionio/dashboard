#!/bin/bash
set -o errexit
set -o pipefail

pushd $(dirname $(dirname "$BASH_SOURCE")) > /dev/null
CUR_DIR=$(pwd)
SRC_DIR=$CUR_DIR
#SRC_DIR=$(cd .. && pwd)
popd > /dev/null

DOCKER_DIR="$SRC_DIR"

REGISTRY=${REGISTRY:-registry.cn-beijing.aliyuncs.com/yunionio}
TAG=${TAG:-latest}

build_src() {
    yarn install
    ./setup.sh
    yarn run build
}

build_image() {
    local tag=$1
    local file=$2
    local path=$3
    docker build -t "$tag" -f "$file" "$3"
}

push_image() {
    local tag=$1
    docker push "$tag"
}

build_src
img_name="$REGISTRY/web:$TAG"
build_image "$img_name" "$DOCKER_DIR/Dockerfile" "$SRC_DIR"
push_image "$img_name"
