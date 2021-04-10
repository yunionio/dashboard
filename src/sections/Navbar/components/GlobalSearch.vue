<template>
  <search-box :options="options" :value="value" @input="search" :placeholder="$t('common_185')" @click.stop.prevent="handleCloseSidebar" defaultSearchKey="name" />
</template>

<script>
import * as R from 'ramda'
import qs from 'qs'

const path = '/global-search-result'

export default {
  name: 'GlobalSearch',
  data () {
    return {
      value: {},
      options: {
        name: {
          label: this.$t('common_186'),
        },
        ip: {
          label: 'IP',
        },
      },
    }
  },
  created () {
    this.initSearchText()
  },
  methods: {
    initSearchText () {
      if (window.location.pathname.includes(path)) {
        const querystr = window.location.search.replace('?', '')
        this.value = qs.parse(querystr)
      }
    },
    search (val) {
      if (R.equals(val, this.value)) {
        this.$bus.$emit('GlobalSearch')
        return
      }
      this.value = val
      if (R.isEmpty(val)) {
        this.$router.push(path)
        return
      }
      const searchPath = `${path}?${qs.stringify(val)}`
      this.$router.push(searchPath)
    },
    handleCloseSidebar () {
      this.$store.dispatch('common/updateObject', {
        name: 'sidebar',
        data: {
          drawerVisible: false,
        },
      })
    },
  },
}
</script>
