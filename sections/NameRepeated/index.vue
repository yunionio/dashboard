<template>
  <div class="ant-form-extra" style="min-height: 0px;">
    <span v-if="show">{{ text }}</span>
    <span v-else-if="loading && !defaultText">
      <a-icon type="sync" class="mr-1" spin />
      <span>正在验证名称是否重复</span>
    </span>
  </div>
</template>
<script>
import _ from 'lodash'

export default {
  name: 'NameRepeated',
  props: {
    name: {
      type: String,
    },
    res: {
      type: String,
      required: true,
    },
    defaultText: {
      type: String,
    },
    version: {
      type: String,
      default: 'v2',
    },
  },
  data () {
    return {
      isRepeated: false,
      loading: false,
    }
  },
  computed: {
    show () {
      if (this.defaultText) {
        return true
      }
      return this.isRepeated
    },
    text () {
      if (this.isRepeated) {
        return '名称重复，系统默认追加“-1”'
      }
      return this.defaultText || ''
    },
  },
  watch: {
    name (newValue) {
      this.isRepeated = false
      if (newValue) {
        this.debouncedFetchQueryList(newValue)
      }
    },
  },
  created () {
    this.debouncedFetchQueryList = _.debounce(this.fetchQueryList, 300)
  },
  destroyed () {
    this.debouncedFetchQueryList = null
  },
  methods: {
    async fetchQueryList (name) {
      this.loading = true
      const manager = new this.$Manager(this.res, this.version)
      try {
        const params = {
          name,
          scope: this.$store.getters.scope,
          filter: `name.contains('${name}')`,
        }
        await manager.get({ id: name, params })
        this.isRepeated = true
        this.loading = false
      } catch (error) {
        if (error.response.status === 404) {
          this.isRepeated = false
        } else {
          this.isRepeated = true
        }
        this.loading = false
        throw error
      }
    },
  },
}
</script>
