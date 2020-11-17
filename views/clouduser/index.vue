<template>
  <div>
    <template v-if="!loaded">
      <p class="text-center"><a-spin /></p>
    </template>
    <template v-else>
      <template v-if="tabs.length === 0">
        <p class="text-center">{{ $t('common.notData') }}</p>
      </template>
      <template v-else>
        <page-header :title="$t('common_325')" :tabs="tabs" :current-tab.sync="currentTab" />
        <page-body>
          <component :is="currentTab" />
        </page-body>
      </template>
    </template>
  </div>
</template>

<script>
import ClouduserList from './components/ClouduserList'
import SamluserList from './components/SamluserList'

export default {
  name: 'User',
  components: {
    ClouduserList,
    SamluserList,
  },
  data () {
    return {
      loaded: false,
      tabs: [],
      currentTab: '',
    }
  },
  created () {
    this.genTabInfos()
  },
  methods: {
    async genTabInfos () {
      try {
        const [cloudusers, samlusers] = await Promise.all([this.fetchCloudusers(), this.fetchSamlusers()])
        if (cloudusers.length > 0) {
          this.tabs.push({ key: 'clouduser-list', label: this.$t('personal_user_tab.cloud') })
        }
        if (samlusers.length > 0) {
          this.tabs.push({ key: 'samluser-list', label: this.$t('personal_user_tab.saml') })
        }
        if (this.tabs.length > 0) {
          this.currentTab = this.tabs[0].key
        }
        this.loaded = true
      } catch (error) {
        throw error
      }
    },
    async fetchCloudusers () {
      let manager = new this.$Manager('cloudusers', 'v1')
      try {
        const response = await manager.list({
          params: {
            user: this.$store.getters.userInfo.id,
            scope: this.$store.getters.scope,
            limit: 1,
          },
        })
        const data = response.data.data || []
        return data
      } finally {
        manager = null
      }
    },
    async fetchSamlusers () {
      let manager = new this.$Manager('samlusers', 'v1')
      try {
        const response = await manager.list({
          params: {
            user: this.$store.getters.userInfo.id,
            scope: this.$store.getters.scope,
            limit: 1,
          },
        })
        const data = response.data.data || []
        return data
      } finally {
        manager = null
      }
    },
  },
}
</script>
