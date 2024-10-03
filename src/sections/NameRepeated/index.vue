<template>
  <div class="ant-form-extra" style="min-height: 0px;">
    <span v-if="show">{{ text }}</span>
    <span v-else-if="loading && !defaultText">
      <a-icon type="sync" class="mr-1" spin />
      <span>{{$t('common_183')}}</span>
    </span>
  </div>
</template>
<script>
import _ from 'lodash'
import * as R from 'ramda'

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
    params: {
      type: [Object, Function],
      default: () => ({}),
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
        return this.$t('common_184')
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
    params (val, oldVal) {
      if (!R.equals(val, oldVal)) {
        this.debouncedFetchQueryList()
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
    async fetchQueryList (name = this.name) {
      this.loading = true
      const manager = new this.$Manager(this.res, this.version)
      try {
        const params = {
          name,
          scope: this.$store.getters.scope,
          filter: `name.equals('${name}')`,
          ...(R.is(Function, this.params) ? this.params() : this.params),
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
