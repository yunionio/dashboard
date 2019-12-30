<template>
  <div class="ant-form-extra" v-if="show">{{ text }}</div>
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
  },
  data () {
    return {
      isRepeated: false,
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
      if (!newValue) {
        this.isRepeated = false
        return true
      }
      this.debouncedFetchQueryList(newValue)
    },
  },
  created () {
    this.debouncedFetchQueryList = _.debounce(this.fetchQueryList, 500)
  },
  methods: {
    async fetchQueryList (name) {
      const manager = new this.$Manager(this.res)
      try {
        const params = {
          name,
          scope: this.$store.getters.scope,
          filter: `name.contains('${name}')`,
        }
        const { data } = await manager.list({ params })
        this.isRepeated = data && data.data.length && data.total
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
