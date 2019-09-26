<template>
  <page-footer>
    <div class="create-server-result-wrap d-flex">
      <div class="content d-flex">
        <div
          v-for="(tip, idx) of tips"
          :key="idx"
          class="d-flex flex-column justify-content-center flex-grow-1">
          <div
            v-for="obj of tip"
            :key="obj.label"
            class="d-flex align-items-center">
            <span class="label" :class="obj.labelClass">{{ obj.label }}：</span>
            <template v-if="obj.value">
              <span class="value text-truncate" :class="obj.valueClass">{{ obj.value }}</span>
            </template>
            <template v-else>
              <span class="value placeholder text-truncate" :class="obj.valueClass">------</span>
            </template>
          </div>
        </div>
        <!-- <div>费用估算</div> -->
      </div>
      <div class="btns-wrapper d-flex align-items-center">
        <a-button :loading="loading" type="primary" html-type="submit" class="ml-3">确认</a-button>
      </div>
      <transition name="errors-slide-fade">
      <div v-if="errors.length" class="errors-wrap" v-clickoutside="closeError">
        <div class="title d-flex align-items-center">
          <i class="el-icon-error mr-2" />
          <span>新建主机失败</span>
        </div>
        <div class="divider" />
        <ul class="list">
          <li
            v-for="(item, idx) of errors"
            :key="idx">
            <div>{{ item.message }}</div>
            <ul class="list sec-list" v-if="item.children">
              <li v-for="(child, childIdx) of item.children" :key="`child-${childIdx}`">{{ child }}</li>
            </ul>
          </li>
        </ul>
      </div>
    </transition>
    </div>
  </page-footer>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import { sizestrWithUnit } from '@/utils/utils'

export default {
  name: 'BottomBar',
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    fd: {
      type: Object,
      required: true,
    },
    errors: {
      type: Array,
      required: true,
    },
  },
  computed: {
    name () {
      return this.fd.name
    },
    zone () {
      let ret = this.fd.zone.label
      if (this.isPublic && !this.isPrepaid) {
        ret = this.fd.sku.selected.zone
      }
      return ret
    },
    type () {
      let ret = '通用云服务器'
      if (this.fd.gpuEnable) {
        ret = 'GPU云服务器'
      }
      return ret
    },
    disk () {
      const diskValueArr = []
      R.forEachObjIndexed((item, key) => {
        if (key.includes('DiskSize')) {
          diskValueArr.push(item)
        }
      }, this.fd)
      return diskValueArr.reduce((prevDisk, diskValue) => prevDisk + diskValue, 0)
    },
    config () {
      const ret = []
      const { gpu, gpuCount, vcpu, vmem } = this.fd
      if (this.fd.gpuEnable) {
        ret.push(`${gpuCount}块GPU（${gpu}）`)
      }
      if (this.isPublic && this.isPrepaid) {
        if (!R.isNil(this.fd.spec) && !R.isEmpty(this.fd.spec)) {
          ret.push(`${this.fd.spec.vcpu_count}核CPU`)
          ret.push(`${this.fd.spec.vmem_size}GB内存`)
        }
      } else {
        ret.push(`${vcpu}核CPU`)
        ret.push(`${sizestrWithUnit(vmem, 'M', 1024)}内存`)
      }
      ret.push(`${this.disk}GB磁盘（${_.get(this.fd, 'systemDiskType.label') || '-'}）`)
      return ret.join('、')
    },
    image () {
      return this.fd.image.label
    },
    tips () {
      const ret = [
        [
          { label: '名称', labelClass: 'label-w-50', value: this.name, valueClass: 'name-value' },
          { label: '数量', labelClass: 'label-w-50', value: this.fd.count },
        ],
        [
          { label: '区域', labelClass: 'label-w-50', value: this.zone },
          { label: '类型', labelClass: 'label-w-50', value: this.type },
        ],
        [
          { label: '配置', labelClass: 'label-w-80', value: this.config },
          { label: '操作系统', labelClass: 'label-w-80', value: this.image },
        ],
      ]
      return ret
    },
  },
  methods: {
    closeError () {
      this.$emit('update:errors', [])
    },
  },
}
</script>

<style lang="scss" scoped>
@import '../../../../../../src/styles/_variables.scss';

.create-server-result-wrap {
  position: relative;
  .content {
    width: 80%;
    .label {
      color: #999;
      &.label-w-50 {
        width: 50px;
      }
      &.label-w-80 {
        width: 80px;
      }
    }
    .value {
      max-width: 300px;
      &.name-value {
        width: 100px;
      }
      &.placeholder {
        color: #888;
        font-style: italic;
      }
    }
    .prices {
      .hour {
        color: $error-color;
        font-size: 24px;
      }
      .tips {
        color: #999;
        font-size: 12px;
      }
    }
  }
  .btns-wrapper {
    position: absolute;
    right: 20px;
  }
  .errors-wrap {
    position: absolute;
    right: 0;
    bottom: 100px;
    width: 300px;
    padding: 15px;
    opacity: 1;
    transform: translateX(0);
    background-color: #fef0f0;
    box-shadow: -5px -5px 5px rgba(0, 0, 0, 0.1);
    border-top-left-radius: 3px;
    .title {
      color: $error-color;
      > i {
        font-size: 28px;
      }
      > span {
        font-size: 13px;
        font-weight: bold;
      }
    }
    .divider {
      margin: 15px 0;
      background-color: #DCDFE6;
      height: 1px;
    }
    .list {
      padding: 0 15px;
      color: $error-color;
      li {
        line-height: 1.8;
        list-style-type: disc;
      }
      &.sec-list {
        li {
          list-style-type: circle;
        }
      }
    }
  }
  .errors-slide-fade-enter-active {
    transition: all .3s ease;
  }
  .errors-slide-fade-leave-active {
    transition: all .3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }
  .errors-slide-fade-enter, .errors-slide-fade-leave-to {
    transform: translateX(300px);
    opacity: 0;
  }
}
</style>
