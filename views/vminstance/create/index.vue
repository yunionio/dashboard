<template>
  <div>
    <page-header :title="headerTitle" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <component :is="component" :type="type" />
  </div>
</template>

<script>
/* eslint-disable */
import IDC from './form/IDC'
import Public from './form/Public'
import Private from './form/Private'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'

export default {
  name: 'ServerCreate',
  components: {
    IDC,
    Public,
    Private,
  },
  data () {
    const cloudEnvOptions = getCloudEnvOptions('compute_engine_brands', true)
    const queryType = this.$route.query.type
    let cloudEnv = queryType === 'idc' ? 'onpremise' : this.$route.query.type
    if (!cloudEnvOptions.find(val => val.key === cloudEnv)) {
      cloudEnv = cloudEnvOptions[0].key
    }
    return {
      cloudEnvOptions,
      cloudEnv,
    }
  },
  computed: {
    type () {
      const { type = 'idc' } = this.$route.query
      switch (type) {
        case 'private':
          return 'private'
        case 'public':
          return 'public'
        default:
          return 'idc'
      }
    },
    component () {
      const { type = 'idc' } = this.$route.query
      switch (type) {
        case 'private':
          return 'Private'
        case 'public':
          return 'Public'
        default:
          return 'IDC'
      }
    },
    headerTitle () {
      let type
      switch (this.type) {
        case 'idc':
          type = '本地IDC'
          break
        case 'private':
          type = '私有云'
          break
        case 'public':
          type = '公有云'
          break
        default:
          type = '本地IDC'
          break
      }
      let res
      if (this.$route.query.source === 'servertemplate') {
        res = '模板'
      } else {
        res = '虚拟机'
      }
      return `新建${type}${res}`
    },
  },
  watch: {
    cloudEnv: {
      handler (val) {
        this.$nextTick(() => {
          const query = this.$router.history.current.query
          const path = this.$router.history.current.path
          const newQuery = JSON.parse(JSON.stringify(query))
          newQuery.type = val === 'onpremise' ? 'idc' : val
          this.$router.push({ path, query: newQuery })
        })
      },
      immediate: true
    },
  },
}
</script>
