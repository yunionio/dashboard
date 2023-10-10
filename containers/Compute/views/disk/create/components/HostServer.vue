<template>
  <a-row>
    <a-col :span="6" class="mr-2" v-show="!isProjectMode">
      <a-form-item>
        <a-select
          show-search
          allow-clear
          v-decorator="decorators.host"
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
      </a-form-item>
    </a-col>
    <a-col :span="6">
      <a-form-item>
        <a-select
          show-search
          allow-clear
          v-decorator="decorators.server"
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
      </a-form-item>
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
    form: Object,
    decorators: Object,
    cloudEnv: {
      type: String,
      default: 'onpremise',
    },
    query: {
      type: Object,
      default () {
        return {}
      },
    },
  },
  data () {
    return {
      isHostLoading: false,
      isHostLoaded: true,
      hosts: [],
      isServerLoading: false,
      isServerLoaded: true,
      servers: [],
    }
  },
  computed: {
    ...mapGetters(['isProjectMode', 'scope']),
  },
  watch: {
    query: {
      handler: function (val) {
        this.fetchHosts(val)
      },
      deep: true,
    },
  },
  created () {
    this.hostManager = new Manager('hosts')
    this.serverManager = new Manager('servers')
    this.fetchHosts = _.debounce(this._fetchHosts, 500)
    this.fetchServers = _.debounce(this._fetchServers, 500)
    if (!this.isProjectMode) {
      this.fetchHosts(this.query)
    } else {
      this.fetchServers({})
    }
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
        if (this.hosts[0]) {
          this.form.fc.setFieldsValue({
            host: this.hosts[0].id,
          })
          this.fetchServers({ joint_filter: `hosts.id(host_id).name.contains(${this.hosts[0].name})` })
        }
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
        // if (this.servers[0]) {
        //   this.form.fc.setFieldsValue({
        //     host: this.servers[0].host_id,
        //     server: this.servers[0].id,
        //   })
        // }
        this.isServerLoaded = true
      } catch (error) {
        console.log(error)
      } finally {
        this.isServerLoading = false
      }
    },
    hostSelectChange (v) {
      if (v) {
        const curHost = this.hosts.find(item => item.id === v)
        this.fetchServers({ joint_filter: `hosts.id(host_id).name.contains(${curHost.name})` })
      } else {
        this.servers = []
        this.form.fc.setFieldsValue({
          server: undefined,
        })
      }
    },
    serverSelectChange (v) {
      const curServer = this.servers.find(item => item.id === v)
      this.form.fc.setFieldsValue({
        server: v,
      })
      if (this.isProjectMode) {
        this.form.fc.setFieldsValue({
          host: curServer ? curServer.host_id : '',
        })
      }
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
