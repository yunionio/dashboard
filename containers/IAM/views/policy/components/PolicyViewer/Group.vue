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
                v-if="!action.children"
                :key="action.key"
                class="mb-2 tag">{{ action.label }}</span>
              <a-button :key="action.key" v-else type="link" @click="showExtraAction(action.children)">{{ action.label }}</a-button>
            </template>
          </div>
        </div>
      </template>
    </a-card>
  </div>
</template>

<script>
import * as R from 'ramda'
import WindowsMixin from '@/mixins/windows'

export default {
  mixins: [WindowsMixin],
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
      const sortKeys = ['list', 'get', 'update', 'create', 'delete', 'perform']
      const sortActions = R.sort((a, b) => {
        return sortKeys.indexOf(a.key) - sortKeys.indexOf(b.key)
      }, actions)
      const normalActions = sortActions.filter(item => sortKeys.includes(item.key))
      // 将详细操作收起来
      const extraActions = sortActions.filter(item => !sortKeys.includes(item.key))
      if (extraActions.length) {
        normalActions.push({ key: 'extra', label: this.$t('iam.count_items', [extraActions.length]), children: extraActions })
      }
      return normalActions
    },
    showExtraAction (actions) {
      this.createDialog('PolicyExtraActionConfig', {
        title: this.$t(''),
        name: this.$t(''),
        resource: { disabled: true },
        actions: actions.map(item => ({ action: item.key, label: item.label })),
        checked: actions.map(action => action.key),
        isViewer: true,
      })
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
