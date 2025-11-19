<template>
  <div class="position-relative h-100 w-100 overflow-auto dashboard_box">
    <template v-for="(item, key) of data">
      <div
        v-if="!['Quota', 'ProjectQuota'].includes(item.layout.component) || (['Quota', 'ProjectQuota'].includes(item.layout.component) && globalConfig.enable_quota_check)"
        class="item"
        :key="key"
        :style="getItemStyles(item.layout)">
        <component
          ref="children"
          :chartId="key"
          :is="item.layout.component"
          :options="item.layout"
          :params="item.params"
          :dataRangeParams="dataRangeParams" />
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as R from 'ramda'
import getExtendsComponents from '@scope/extends'
import { clear as clearCache } from '@Dashboard/utils/cache'

const extendsComponents = R.is(Function, getExtendsComponents) ? getExtendsComponents() : getExtendsComponents

export default {
  name: 'DashboardContent',
  components: {
    ...extendsComponents,
  },
  props: {
    // 卡片配置
    data: {
      type: [Array, Object],
      required: true,
    },
    dataRangeParams: {
      type: Object,
    },
  },
  computed: {
    ...mapGetters(['globalConfig']),
  },
  methods: {
    refresh () {
      clearCache()
      const children = this.$refs.children
      if (R.is(Array, children)) {
        for (let i = 0, len = children.length; i < len; i++) {
          children[i].refresh()
        }
      } else {
        children.refresh()
      }
    },
    setTransform (top, left, width, height) {
      const translate = `translate3d(${left}px, ${top}px, 0)`
      return {
        transform: translate,
        WebkitTransform: translate,
        MozTransform: translate,
        msTransform: translate,
        OTransform: translate,
        width: width + 'px',
        height: height + 'px',
        position: 'absolute',
      }
    },
    getItemStyles (layout) {
      const { x, y, w, h } = layout
      const rowHeight = 30
      const margin = [15, 7.5]
      return {
        width: `calc(${w / 80 * 100}% - 15px)`,
        margin: `0px ${margin[1]}px`,
        height: `calc(${rowHeight * h + Math.max(0, h - 1) * margin[0]}px)`,
        left: `calc(${(x / 80 * 100)}%`,
        top: Math.round(rowHeight * y) + (y + 1) * margin[0] + 'px',
        position: 'absolute',
      }
    },
  },
}
</script>

<style lang="less" scoped>
.dashboard_box{
  min-width: 1008px;
  background: rgb(245, 247, 254);
}
.item {
  border-radius: 5px;
  &:hover{
    box-shadow: 0px 0px 8px 3px #a3a0a02e;
    border: 0 none;
  }
  .dashboard-card-wrap{
    border-radius: 4px;
  }
  border: 1px solid #E7E8EB;
}
</style>
