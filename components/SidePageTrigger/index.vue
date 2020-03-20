<template>
  <a v-if="isLink" @click="clickHandle"><slot /></a>
  <span v-else><slot /></span>
</template>

<script>
import config from './config/index.js'
import { hasPermission } from '@/utils/auth'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'SidePageTrigger',
  mixins: [WindowsMixin],
  props: {
    vm: {
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
      const { sidePage } = this.$store.state.common
      return hasPermission({ key: this.permission }) && (sidePage.names.indexOf(this.name) > -1 || !this.name)
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
        this.sidePageTriggerHandle(vm, name, {
          id,
          ...config[name],
          ...options,
        }, {
          list,
          ...params,
        })
        if (tab) {
          this.initSidePageTab(tab)
        }
      }
    },
  },
}
</script>
