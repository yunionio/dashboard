<template>
  <a v-if="isLink" @click="clickHandle"><slot /></a>
  <span v-else><slot /></span>
</template>

<script>
import config from './config/index.js'
import { hasPermission } from '@/utils/auth'

export default {
  name: 'SidePageTrigger',
  props: {
    vm: {
      type: Object,
    },
    list: {
      type: Object,
    },
    name: {
      type: String,
    },
    id: {
      type: String,
    },
    tab: {
      type: String,
    },
    options: {
      type: Object,
      default: () => ({}),
    },
    params: {
      type: Object,
      default: () => ({}),
    },
    permission: {
      type: String,
    },
  },
  computed: {
    isLink () {
      const { globalSidePages } = this.$store.state.common
      return hasPermission({ key: this.permission }) && (globalSidePages.names.indexOf(this.name) > -1 || !this.name)
    },
  },
  methods: {
    handlePropsTrigger () {
      this.$emit('trigger')
    },
    clickHandle () {
      if (this.$listeners.trigger) {
        return this.handlePropsTrigger()
      }
      if (this.name && this.id && this.vm) {
        const { name, id, vm, options, list, tab, params } = this
        vm.sidePageTriggerHandle(vm, name, {
          id,
          ...config[name],
          ...options,
        }, {
          list,
          ...params,
        })
        if (tab) {
          vm.initSidePageTab(tab)
        }
      }
    },
  },
}
</script>
