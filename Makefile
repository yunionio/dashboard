ROOT_DIR := $(CURDIR)

REGISTRY ?= "registry.cn-beijing.aliyuncs.com/yunionio"

VERSION ?= $(shell git describe --exact-match 2> /dev/null || \
                git describe --match=$(git rev-parse --short=8 HEAD) --always --dirty --abbrev=8)

img:=$(REGISTRY)/node:20-alpine-git
node-build:
	docker buildx build -f Dockerfile.node-build --platform linux/amd64 -t $(img) . --push

image:
	DEBUG=$(DEBUG) ARCH=$(ARCH) TAG=$(VERSION) REGISTRY=$(REGISTRY) $(ROOT_DIR)/scripts/docker_push.sh
