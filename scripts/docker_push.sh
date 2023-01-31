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
    yarn install
    ./scripts/setup.sh
    yarn run build
}


buildx_and_push() {
    local tag=$1
    local file=$2
    local path=$3
    local arch=$4
    docker buildx build -t "$tag" --platform "linux/$arch" -f "$2" "$3" --push
    docker pull "$tag"
}

make_manifest_image() {
    local img_name=$1
    docker manifest create --amend $img_name \
        $img_name-amd64 \
        $img_name-arm64
    docker manifest annotate $img_name $img_name-arm64 --arch arm64
    docker manifest push $img_name
}

build_src
img_name="$REGISTRY/web:$TAG"

set -x

case $ARCH in
    amd64 | "arm64" )
        buildx_and_push "$img_name" "$DOCKER_DIR/Dockerfile" "$SRC_DIR" "$ARCH"
        ;;
    all)
        for arch in "arm64" "amd64"; do
            buildx_and_push "$img_name-$arch" "$DOCKER_DIR/Dockerfile" "$SRC_DIR" "$arch"
        done
        make_manifest_image $img_name
        ;;
esac

