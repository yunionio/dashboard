<template>
  <div class="mb-3 group-wrap" :class="{ active: showContent }">
    <div class="d-flex">
      <div class="d-flex group-title" @click.stop.prevent="toggleContent">
        <div>{{ data.label }}</div>
        <div class="arrow-icon">
          <a-icon type="down" class="ml-2" />
        </div>
      </div>
    </div>
    <a-card v-if="showContent" class="mt-2">
      <template v-for="item of data.children">
        <div :key="item.key" class="d-flex mt-2 mb-2">
          <div class="title flex-grow-0 flex-shrink-0 text-truncate">{{ item.label }}</div>
          <div class="actions flex-fill">
            <template v-for="action of sortActions(item.actions)">
              <span
                :key="action.key"
                class="mb-2 tag">{{ action.label }}</span>
            </template>
          </div>
        </div>
      </template>
    </a-card>
  </div>
</template>

<script>
import * as R from 'ramda'

export default {
  props: {
    data: {
      required: true,
      type: Object,
    },
  },
  data () {
    return {
      showContent: false,
    }
  },
  methods: {
    toggleContent () {
      this.showContent = !this.showContent
    },
    sortActions (actions) {
      const sortKeys = ['list', 'get', 'update', 'create', 'delete', 'perform', 'vnc']
      return R.sort((a, b) => {
        return sortKeys.indexOf(a.key) - sortKeys.indexOf(b.key)
      }, actions)
    },
  },
}
</script>

<style lang="less" scoped>
.group-title {
  width: 100px;
  cursor: pointer;
}
.active {
  .arrow-icon {
    > i {
      transform: rotate(180deg);
    }
  }
}
.group-wrap {
  .arrow-icon {
    > i {
      transition: transform .3s ease;
    }
  }
}
.title {
  width: 140px;
}
.tag {
  color: rgba(0,0,0,.65);
  height: auto;
  margin: 0 8px 0 0;
  padding: 2px 7px;
  line-height: 2;
  background: #fafafa;
  border: 1px solid #d9d9d9;
}
</style>
