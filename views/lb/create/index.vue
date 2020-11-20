<template>
  <div>
    <page-header :title="headerTitle" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <component :is="component" :type="type" ref="formRef" />
    </page-body>
    <page-footer>
      <template v-slot:right>
        <a-button type="primary" class="mr-2" @click="submit" :loading="loading">{{ $t('common.create') }}</a-button>
        <a-button @click="cancel">{{$t('network.text_31')}}</a-button>
      </template>
    </page-footer>
  </div>
</template>

<script>
import IDC from './form/IDC'
import Public from './form/Public'
import Private from './form/Private'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'

export default {
  name: 'LbCreate',
  components: {
    IDC,
    Public,
    Private,
  },
  data () {
    const cloudEnvOptions = getCloudEnvOptions('compute_engine_brands', true)
    const queryType = this.$route.query.type
    let cloudEnv = queryType === 'idc' ? 'onpremise' : this.$route.query.type
    let routerQuery = this.$route.query.type
    if (!cloudEnvOptions.find(val => val.key === cloudEnv)) {
      cloudEnv = cloudEnvOptions[0].key
      routerQuery = cloudEnv === 'onpremise' ? 'idc' : cloudEnv
    }
    return {
      loading: false,
      cloudEnvOptions,
      cloudEnv,
      routerQuery,
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
          type = this.$t('compute.text_1160')
          break
        case 'private':
          type = this.$t('compute.text_400')
          break
        case 'public':
          type = this.$t('compute.text_401')
          break
        default:
          type = this.$t('compute.text_1160')
          break
      }
      const res = this.$t('network.text_137')
      return this.$t('compute.text_1161', [type, res])
    },
  },
  watch: {
    cloudEnv (val) {
      this.$nextTick(() => {
        const query = this.getQuery(this.$router.history.current.query)
        const path = this.$router.history.current.path
        const newQuery = JSON.parse(JSON.stringify(query))
        newQuery.type = val === 'onpremise' ? 'idc' : val
        this.$router.push({ path, query: newQuery })
      })
    },
  },
  created () {
    if (this.routerQuery !== this.$route.query.type) {
      this.$router.push({
        path: this.$router.history.current.path,
        query: {
          type: this.routerQuery,
        },
      })
    }
  },
  beforeDestroy () {
    window.removeEventListener('popstate', this.popstate)
  },
  methods: {
    getQuery (query) {
      if (query.sence === 'image') {
        return { type: query.type }
      }
      return query
    },
    async submit () {
      this.loading = true
      try {
        const data = await this.$refs.formRef.submit()
        await new this.$Manager('loadbalancers').create({ data })
        this.loading = false
        this.$message.success(this.$t('network.text_290'))
        this.cancel()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    cancel () {
      this.$router.push('/lb')
    },
  },
}
</script>
