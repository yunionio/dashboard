<template>
  <a-row>
    <a-col :span="6" class="mr-2" v-if="isAdminMode">
      <a-select
        show-search
        allow-clear
        v-model="host"
        :disabled="!isHostLoaded"
        :loading="isHostLoading"
        :filter-option="false"
        :placeholder="$t('common.choose.host')"
        @search="handleHostSearch"
        @change="hostSelectChange">
        <a-select-option
          v-for="item of hosts"
          :key="item.id"
          :value="item.id">
          {{ item.name }}
        </a-select-option>
      </a-select>
    </a-col>
    <a-col :span="6">
      <a-select
        show-search
        allow-clear
        v-model="server"
        :disabled="!isServerLoaded"
        :loading="isServerLoading"
        :filter-option="false"
        :placeholder="$t('common.choose.server')"
        @search="handleServerSearch"
        @change="serverSelectChange">
        <a-select-option
          v-for="item of servers"
          :key="item.id"
          :value="item.id">
          {{ item.name }}
        </a-select-option>
      </a-select>
    </a-col>
  </a-row>
</template>

<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'
import { Manager } from '@/utils/manager'

export default {
  name: 'HostServer',
  props: {
    value: {
      type: String,
    },
    cloudEnv: {
      type: String,
      default: 'onpremise',
    },
  },
  data () {
    return {
      isHostLoading: false,
      isHostLoaded: true,
      host: undefined,
      hosts: [],
      isServerLoading: false,
      isServerLoaded: true,
      server: this.value,
      servers: [],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope']),
  },
  watch: {
    value (val) {
      if (val) {
        this.server = val
      }
    },
  },
  created () {
    this.hostManager = new Manager('hosts')
    this.serverManager = new Manager('servers')
    this.fetchHosts = _.debounce(this._fetchHosts, 500)
    this.fetchServers = _.debounce(this._fetchServers, 500)
    this.fetchHosts()
  },
  methods: {
    async _fetchHosts (query) {
      this.hosts = []
      try {
        const params = {
          scope: this.scope,
          show_fail_reason: true,
          details: false,
          baremetal: false,
          limit: 0,
          brand: 'OneCloud',
          ...query,
        }
        this.isHostLoading = true
        this.isHostLoaded = false
        const { data } = await this.hostManager.list({ params })
        this.hosts = data.data.map(item => {
          return {
            id: item.id,
            name: item.name,
          }
        })
        // this.host = this.hosts[0]?.id
        this.isHostLoaded = true
      } catch (error) {
        console.log(error)
      } finally {
        this.isHostLoading = false
      }
    },
    async _fetchServers (query) {
      this.servers = []
      try {
        const params = {
          scope: this.scope,
          show_fail_reason: true,
          details: true,
          with_meta: true,
          filter: 'hypervisor.notin(baremetal,container)',
          limit: 10,
          cloud_env: this.cloudEnv,
          brand: 'OneCloud',
          ...query,
        }
        this.isServerLoading = true
        this.isServerLoaded = false
        const { data } = await this.serverManager.list({ params })
        this.servers = data.data.map(item => {
          return {
            id: item.id,
            name: item.name,
            host: item.host,
            host_id: item.host_id,
          }
        })
        this.server = this.servers[0]?.id
        this.$emit('change', this.server)
        this.isServerLoaded = true
      } catch (error) {
        console.log(error)
      } finally {
        this.isServerLoading = false
      }
    },
    hostSelectChange (v) {
      if (v) {
        this.host = v
        const curHost = this.hosts.find(item => item.id === v)
        this.fetchServers({ joint_filter: `hosts.id(host_id).name.contains(${curHost.name})` })
      } else {
        this.server = undefined
        this.servers = []
      }
    },
    serverSelectChange (v) {
      const curServer = this.servers.find(item => item.id === v)
      this.host = curServer.host_id
      this.$emit('change', v)
    },
    handleHostSearch (v) {
      this.fetchHosts({ filter: `name.contains('${v}')` })
    },
    handleServerSearch (v) {
      this.fetchServers({ filter: `name.contains('${v}')` })
    },
  },
}
</script>
