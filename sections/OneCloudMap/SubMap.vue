<template>
  <div class="onecloud-sub-map-item">
    <div class="font-weight-bold mb-2 map-label">{{ getLabel(sub.meta) }}</div>
    <ul class="list-unstyled">
      <template v-for="item of menus">
        <li :key="item.path">
          <router-link :to="item.path" class="map-link text-truncate" :title="getLabel(item.meta)" @click.native="() => handleClick(item)">{{ getLabel(item.meta) }}</router-link>
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
import * as R from 'ramda'

export default {
  name: 'OneCloudSubMap',
  props: {
    sub: {
      type: Object,
      required: true,
    },
    search: {
      type: String,
      required: true,
    },
    showMenu: {
      type: Function,
      required: true,
    },
    getLabel: {
      type: Function,
      required: true,
    },
    getSearchMatch: {
      type: Function,
      required: true,
    },
  },
  computed: {
    l2SearchMatched () {
      return this.getSearchMatch(this.sub)
    },
    menus () {
      const ret = []
      R.forEach(l3 => {
        let show = false
        if (this.showMenu(l3)) {
          // 2级菜单或3级菜单被匹配则显示
          if (this.l2SearchMatched || this.getSearchMatch(l3)) {
            show = true
          }
        }
        if (show) {
          ret.push(l3)
        }
      }, this.sub.submenus)
      return ret
    },
  },
  methods: {
    handleClick (item) {
      this.$emit('click', item)
    },
  },
}
</script>

<style lang="less" scoped>
@import "../../styles/less/theme";

.onecloud-sub-map-item {
  .map-label {
    font-size: 14px;
    padding: 0 5px;
  }
  .map-link {
    padding: 5px 5px;
    display: block;
    font-size: 13px;
    color: @text-color-secondary;
    text-decoration: none;
    transition: all 300ms ease 0s;
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
}
</style>
