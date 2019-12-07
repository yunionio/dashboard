<template>
  <div v-if="isRepeated">名称重复，系统默认追加“-1”</div>
</template>
<script>
import _ from 'lodash'
export default {
  name: 'nameRepeated',
  props: {
    name: {
      type: String,
    },
    res: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      isRepeated: false,
    }
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
          filter: `name.contains(${name})`,
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
