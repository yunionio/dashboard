<template>
  <div class="status-wrapper">
    <div class="d-flex" :title="statusText">
      <div class="status-icon d-flex justify-content-center align-items-center flex-grow-0 flex-shrink-0">
        <a-icon v-if="!statusClass" type="sync" spin />
        <span v-else class="status-dot" :class="statusClass" />
      </div>
      <div class="status-text text-truncate">
        {{ statusText }}
        <slot name="icon" />
        <span v-if="showProcess && !changedStatus">({{curProcess}}%)</span>
      </div>
      <div class="flex-fill">
        <copy v-if="!isBooleanValue" class="status-copy" :message="status" style="margin-top:3px;margin-left:5px" />
      </div>
    </div>
    <div v-if="changedStatus && showProcess" style="width:100px;margin-left:5px">
      <div style="font-size:12px;line-height:12px;color:#9c9c9c;transform:translateY(7px)">{{ originStatusText }}</div>
      <a-progress class="custom-progress-bar" :percent="curProcess" :showInfo="false" size="small" status="active" :title="originStatusText + ': ' + curProcess + '%'" />
    </div>
    <slot />
  </div>
</template>

<script>
import * as R from 'ramda'
import expectStatusMap from '@/constants/expectStatus'
import { status as statusMap } from '@/locales/zh-CN'
import { scopeStatus as scopeStatusMap } from '@scope/locales/zh-CN'

export default {
  name: 'Status',
  props: {
    status: {
      type: [String, Boolean],
      required: true,
    },
    statusModule: { // 映射 expectStatusMap 里面的 key 值
      type: String,
      required: true,
    },
    dangerStatusBase: {
      type: Array,
      default: () => [new RegExp('fail')],
    },
    // 指定状态
    specifyStatus: {
      type: Object,
      default: () => {
        return {
          class: '',
          text: '',
        }
      },
    },
    process: {
      type: Number,
    },
    showStatusProgress: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    isBooleanValue () {
      return R.is(Boolean, this.status)
    },
    changedStatus () {
      if (this.statusModule === 'server' && this.status === 'block_stream') {
        return 'running'
      }
      return ''
    },
    statusClass () {
      if (this.specifyStatus.class) return this.specifyStatus.class
      const currentStatusMap = expectStatusMap[this.statusModule]
      if (currentStatusMap) {
        if (this.isStatus(currentStatusMap.success) || this.isStatus(expectStatusMap.common.success)) {
          return ['status-success']
        }
        const dangerStatus = this.dangerStatusBase.concat(currentStatusMap.danger || [])
        if (this.isStatus(dangerStatus) || this.isStatus(expectStatusMap.common.danger)) {
          return ['status-danger']
        }
        if (this.isStatus(currentStatusMap.info) || this.isStatus(expectStatusMap.common.info)) {
          return ['status-info']
        }
        if (this.isStatus(currentStatusMap.warning)) {
          return ['status-warning']
        }
      }
      return ''
    },
    statusText () {
      if (this.specifyStatus.text) return this.specifyStatus.text
      const moduleStatusMap = scopeStatusMap[this.statusModule] || statusMap[this.statusModule]
      if (moduleStatusMap) {
        if (moduleStatusMap[this.changedStatus || this.status]) {
          return this.$te(`scopeStatus.${this.statusModule}.${this.changedStatus || this.status}`) ? this.$t(`scopeStatus.${this.statusModule}.${this.changedStatus || this.status}`) : this.$t(`status.${this.statusModule}.${this.changedStatus || this.status}`)
        }
      }
      if (statusMap.common[this.changedStatus || this.status]) {
        return this.$t(`status.common.${this.changedStatus || this.status}`)
      }
      return this.changedStatus || this.status
    },
    originStatusText () {
      if (!this.changedStatus) return ''
      if (this.specifyStatus.text) return this.specifyStatus.text
      const moduleStatusMap = statusMap[this.statusModule]
      if (moduleStatusMap) {
        if (moduleStatusMap[this.status]) {
          return this.$te(`scopeStatus.${this.statusModule}.${this.status}`) ? this.$t(`scopeStatus.${this.statusModule}.${this.status}`) : this.$t(`status.${this.statusModule}.${this.status}`)
        }
      }
      if (statusMap.common[this.status]) {
        return this.$t(`status.common.${this.status}`)
      }
      return this.status
    },
    curProcess () {
      return Math.ceil(+this.process * 100) / 100
    },
    showProcess () {
      if (!['server', 'image'].includes(this.statusModule)) return false
      if (!['block_stream', 'migrating', 'image_caching', 'saving', 'live_migrating', 'save_disk'].includes(this.status)) return false
      if (this.statusModule === 'server' && !this.showStatusProgress) return false
      return this.curProcess > 0 && this.curProcess < 100
    },
  },
  methods: {
    // 判断是否为预期状态
    isStatus (statusList) {
      if (R.is(Array, statusList)) {
        return statusList.some(status => {
          if (R.is(RegExp, status)) return status.test(this.changedStatus || this.status)
          if (R.is(String, status) || R.is(Boolean, status)) return status === (this.changedStatus || this.status)
          return false
        })
      }
      return false
    },
  },
}
</script>

<style scoped lang="less">
@import '../../styles/less/theme';

.status-wrapper {
  width: 100%;
  .status-icon {
    width: 20px;
    .status-success.status-dot {
      background-color: @success-color;
      // &::after {
      //   position: absolute;
      //   top: 0;
      //   left: 0;
      //   width: 100%;
      //   height: 100%;
      //   border: 1px solid #1890ff;
      //   border-radius: 50%;
      //   animation: antStatusProcessing 1.2s ease-in-out infinite;
      //   content: "";
      // }
    }
    .status-danger.status-dot {
      background-color: @error-color;
    }
    .status-info.status-dot {
      background-color: @normal-color;
    }
    .status-warning.status-dot {
      background-color: @warning-color;
    }
    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      position: relative;
    }
    .oc-status-process {
      width: 10px;
      height: 10px;
    }
  }
  .status-copy {
    display: none;
  }
  &:hover {
    .status-copy {
      display: inline-block;
    }
  }
}

</style>
