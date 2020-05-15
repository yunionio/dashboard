<template>
  <div class="w-100">
    <!-- <a-input-search v-model="value" placeholder="请输入您要搜索资源的名称或IP" style="width: 300px" @search="onSearch" /> -->
    <search-box :options="options" :value="value" @input="search" placeholder="请输入您要搜索资源的名称或IP" />
  </div>
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
          label: '名称',
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
  },
}
</script>
