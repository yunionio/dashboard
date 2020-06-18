<template>
  <div class="extend-gallery-wrap d-flex flex-column">
    <div class="extend-gallery-title flex-grow-0 flex-shrink-0">磁贴库</div>
    <div class="extend-gallery-tips flex-grow-0 flex-shrink-0 d-flex">
      <div>{{ sortExtendsOptions.length }} 个磁贴</div>
      <div class="flex-fill text-right">可将任意磁贴拖动到仪表盘</div>
    </div>
    <div class="flex-fill extend-list overflow-auto position-relative">
      <ul>
        <li
          class="extend-gallery-item d-flex align-items-center"
          v-for="item in sortExtendsOptions"
          :key="item.component"
          :data-component="item.component">
          <div class="extend-thumb"><icon :type="item.icon" style="font-size: 40px; color: #2A8FF7;" /></div>
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
import { mapGetters } from 'vuex'
import * as R from 'ramda'
import { extendsOptions } from '@Dashboard/extends'

export default {
  name: 'ExtendGallery',
  data () {
    return {
      extendsOptions,
    }
  },
  computed: {
    ...mapGetters(['scope']),
    sortExtendsOptions () {
      const ret = []
      R.forEachObjIndexed((value, key) => {
        let effective = true
        // 如果未声明scope，则全部视图可见，设置了scope则根据scope来渲染
        if (value.scope && !value.scope.includes(this.scope)) {
          effective = false
        }
        if (effective) {
          ret.push({
            ...value,
            component: key,
          })
        }
      }, this.extendsOptions)
      ret.sort((a, b) => a.sort - b.sort)
      return ret
    },
  },
}
</script>

<style lang="scss" scoped>
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
      height: 86px;
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
</style>
