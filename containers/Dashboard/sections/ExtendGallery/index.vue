<template>
  <div class="extend-gallery-wrap d-flex flex-column" :style="wrapStyle">
    <div class="extend-gallery-title flex-grow-0 flex-shrink-0">{{$t('dashboard.text_93')}}</div>
    <div class="extend-gallery-tips flex-grow-0 flex-shrink-0 d-flex">
      <div>{{$t('dashboard.text_94', [ options.length ])}}</div>
      <div class="flex-fill text-right">{{$t('dashboard.text_95')}}</div>
    </div>
    <div class="flex-fill extend-list overflow-auto position-relative">
      <ul>
        <li
          class="extend-gallery-item d-flex align-items-center"
          v-for="item in options"
          :key="item.component"
          :data-component="item.component">
          <div class="extend-thumb flex-shrink-0 flex-grow-0"><icon :type="item.icon" class="dashboard-icon" /></div>
          <div class="extend-content ml-4 flex-fill">
            <div class="extend-title">{{ item.label }}</div>
            <div class="extend-desc text-color-help mt-1">{{ item.desc }}</div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import store from '@/store'
import options from '@scope/extends/config'
import ceOptions from '@Dashboard/extends/config'

export default {
  name: 'ExtendGallery',
  data () {
    const opts = store.getters.isSysCE ? ceOptions : options
    const extendsOptions = {}
    for (let i = 0, len = opts.length; i < len; i++) {
      extendsOptions[opts[i].component] = { ...opts[i] }
    }
    return {
      opts,
      extendsOptions,
    }
  },
  computed: {
    ...mapGetters(['scope', 'globalConfig']),
    ...mapState('common', ['openCloudShell', 'cloudShellHeight']),
    wrapStyle () {
      return {
        height: this.openCloudShell ? `calc(100% - ${this.cloudShellHeight}px)` : '100%',
      }
    },
    options () {
      const ret = this.opts.filter(item => {
        let effective = true
        if (item.scope && !item.scope.includes(this.scope)) {
          effective = false
        }
        if (!this.globalConfig.enable_quota_check && (item.component === 'Quota' || item.component === 'ProjectQuota')) {
          effective = false
        }
        // 开源版本过滤
        if (process.env.VUE_APP_PLATFORM === 'cmp_public' && ['ConsumptionPercent', 'ConsumptionTrend', 'SuggestsysAlertsOverview', 'SuggestsysAlertsDetail', 'Quota', 'BillHistoryLine', 'ResourceHistoryLine', 'Log', 'AccountHealth'].includes(item.component)) {
          effective = false
        }
        return effective
      })
      return ret
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/less/theme';

.extend-gallery-wrap {
  background-color: #fff;
  width: 300px;
  min-width: 300px;
}
.extend-gallery-item {
  &.drag {
    position: absolute;
    top: 0;
  }
}
.extend-gallery-title {
  padding: 15px;
  font-size: 16px;
  border-bottom: 1px solid #eee;
}
.extend-gallery-tips {
  font-size: 12px;
  padding: 15px;
  border-bottom: 1px solid #eee;
}
.extend-list {
  > ul {
    list-style: none;
    margin: 0;
    padding: 0 15px;
    li {
      padding: 15px 10px;
      border-bottom: 1px solid #eee;
      background-color: #fff;
      touch-action: none;
      // height: 86px;
      width: 100%;
      min-width: 100%;
      position: relative;
      z-index: 99;
      > li {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 99;
      }
    }
  }
}
.extend-thumb {
  width: 40px;
  height: 40px;
  overflow: hidden;
  > img {
    width: 100%;
    vertical-align: middle;
    text-align: center;
  }
}
.extend-desc {
  font-size: 12px;
}
.dashboard-icon {
  font-size: 40px;
  color: @primary-color;
}
</style>
