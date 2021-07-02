ROOT_DIR := $(CURDIR)

REGISTRY ?= "registry.cn-beijing.aliyuncs.com/yunionio"

VERSION ?= $(shell git describe --exact-match 2> /dev/null || \
                git describe --match=$(git rev-parse --short=8 HEAD) --always --dirty --abbrev=8)

image:
	DEBUG=$(DEBUG) ARCH=$(ARCH) TAG=$(VERSION) REGISTRY=$(REGISTRY) $(ROOT_DIR)/scripts/docker-push.sh
