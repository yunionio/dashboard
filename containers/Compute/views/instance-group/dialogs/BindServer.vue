<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">绑定主机</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <template v-slot:message>
          <div>新建虚拟机时加入主机组，将按照主机组内规则调度选择宿主机。</div>
          <div class="mt-2">已创建的虚拟机加入主机组后虚拟机所属宿主机不会变化。</div>
        </template>
      </a-alert>
      <dialog-selected-tips :count="params.data.length" action="绑定主机" name="主机组" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-select
        v-if="serversLoaded"
        class="w-100"
        mode="multiple"
        placeholder="请选择要绑定的主机"
        :defaultValue="defaultSelected"
        :loading="serversLoading"
        @search="debounceFetchServers"
        @change="handleSelectChange">
        <a-select-option
          v-for="item of servers"
          :key="item.id">{{ item.name }}</a-select-option>
      </a-select>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import debounce from 'lodash/debounce'
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'InstanceGroupBindServerDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      // 获取的主机列表
      servers: [],
      serversLoading: false,
      // 主机列表是否已加载
      serversLoaded: false,
      // 已选择的主机
      selectedServers: [],
      // 已绑定的主机
      bindedServers: [],
      // 默认选择
      defaultSelected: [],
    }
  },
  computed: mapGetters(['scope']),
  destroyed () {
    this.serversManager = null
    this.debounceFetchServers = null
  },
  created () {
    this.fetchBindedServers()
    this.serversManager = new this.$Manager('servers')
    this.debounceFetchServers = debounce(this.fetchServers, 300)
  },
  methods: {
    serversMapper (data) {
      data = data.filter(item => {
        const paramData = this.params.data[0]
        const isSameTenant = item.tenant_id === paramData.tenant_id
        const isRunning = item.status === 'running'
        const isReady = item.status === 'ready'
        const isOneCloud = item.brand === 'OneCloud'
        return isSameTenant && (isRunning || isReady) && isOneCloud
      })
      data = data.concat(this.bindedServers)
      data = R.uniqBy(item => item.id, data)
      return data
    },
    async fetchBindedServers () {
      const manager = new this.$Manager('servers')
      try {
        const { data: { data = [] } } = await manager.list({
          params: {
            scope: this.scope,
            group: this.params.data[0]['id'],
          },
        })
        this.bindedServers = data
        this.defaultSelected = data.map(item => item.id)
        this.fetchServers()
      } catch (error) {
        throw error
      }
    },
    async fetchServers (query) {
      this.serversLoading = true
      const params = {
        scope: this.scope,
        project: this.params.data[0]['tenant_id'],
        limit: 20,
        filter: 'hypervisor.notin(baremetal,container)',
      }
      if (query) params.filter = `name.contains(${query})`
      try {
        const { data: { data = [] } } = await this.serversManager.list({
          params,
        })
        const servers = this.serversMapper(data)
        this.servers = servers
        this.serversLoaded = true
      } finally {
        this.serversLoading = false
      }
    },
    doUpdateBindServers (action, ids) {
      const data = {}
      for (let i = 0, len = ids.length; i < len; i++) {
        data[`guest.${i}`] = ids[i]
      }
      return this.params.list.onManager('performAction', {
        id: this.params.data[0]['id'],
        managerArgs: {
          action,
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      const unbindIds = this.defaultSelected.filter(item => {
        return !this.selectedServers.includes(item)
      }).filter(item => !!item)
      const bindIds = this.selectedServers.filter(item => {
        return !this.defaultSelected.includes(item)
      }).filter(item => !!item)
      try {
        if (unbindIds && unbindIds.length) {
          await this.doUpdateBindServers('unbind-guests', unbindIds)
        }
        if (bindIds && bindIds.length) {
          await this.doUpdateBindServers('bind-guests', bindIds)
        }
        this.params.list.refresh()
        this.$bus.$emit('VMInstanceListForInstanceGroupRefreshList')
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
    handleSelectChange (val) {
      this.selectedServers = val
    },
  },
}
</script>
