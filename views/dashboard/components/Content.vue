<template>
  <div class="position-relative">
    <template v-for="(item, key) of data">
      <div
        class="item"
        :key="key"
        :style="getItemStyles(item.layout)">
        <component
          ref="children"
          :is="item.layout.component"
          :options="item.layout"
          :params="item.params" />
      </div>
    </template>
  </div>
</template>

<script>
import * as R from 'ramda'
import { clear as clearCache } from '@Dashboard/utils/cache'
import extendsComponents from '@Dashboard/extends'

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
      const colWidth = 65
      const rowHeight = 65
      const margin = [5, 5]
      const pos = {
        left: Math.round(colWidth * x + (x + 1) * margin[0]),
        top: Math.round(rowHeight * y + (y + 1) * margin[1]),
        width: w === Infinity ? w : Math.round(colWidth * w + Math.max(0, w - 1) * margin[0]),
        height: h === Infinity ? h : Math.round(rowHeight * h + Math.max(0, h - 1) * margin[1]),
      }
      const style = this.setTransform(pos.top, pos.left, pos.width, pos.height)
      return style
    },
  },
}
</script>

<style lang="less" scoped>
.item {
  box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.1);
}
</style>
