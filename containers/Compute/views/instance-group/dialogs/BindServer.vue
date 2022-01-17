<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_483', [$t('dictionary.server')])}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <template v-slot:message>
          <div>{{$t('compute.text_704', [$t('dictionary.instancegroup'), $t('dictionary.instancegroup')])}}</div>
          <div class="mt-2">{{$t('compute.text_707', [$t('dictionary.instancegroup') ])}}</div>
        </template>
      </a-alert>
      <dialog-selected-tips :name="$t('dictionary.instancegroup')" :count="params.data.length" :action="$t('compute.text_483', [this.$t('dictionary.server')])" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form-item :label="$t('dictionary.server')" v-bind="formItemLayout">
        <base-select
          v-if="bindedServersLoaded"
          v-show="serversInitLoaded"
          class="w-100"
          remote
          resource="servers"
          :params="serversParams"
          :value="selectedServers"
          :mapper="serversMapper"
          :init-loaded.sync="serversInitLoaded"
          @change="handleSelectChange"
          :select-props="{ allowClear: true, placeholder: $t('compute.text_702', [this.$t('dictionary.server')]), mode: 'multiple' }" />
       </a-form-item>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
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
      serversInitLoaded: false,
      // 已经绑定列表是否加载
      bindedServersLoaded: false,
      // 已选择的主机
      selectedServers: [],
      // 已绑定的主机
      bindedServers: [],
      // 默认选择
      defaultSelected: [],
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  computed: {
    ...mapGetters(['scope']),
    serversParams () {
      return {
        scope: this.scope,
        project: this.params.data[0].tenant_id,
        limit: 20,
        filter: ['hypervisor.notin(baremetal,container)'],
      }
    },
  },
  destroyed () {
    this.serversManager = null
  },
  created () {
    this.fetchBindedServers()
    this.serversManager = new this.$Manager('servers')
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
            group: this.params.data[0].id,
          },
        })
        this.bindedServers = data
        const defaultList = data.map(item => item.id)
        this.selectedServers = defaultList
        this.defaultSelected = defaultList
        this.bindedServersLoaded = true
      } catch (error) {
        throw error
      }
    },
    doUpdateBindServers (action, ids) {
      const data = {}
      for (let i = 0, len = ids.length; i < len; i++) {
        data[`guest.${i}`] = ids[i]
      }
      return this.params.onManager('performAction', {
        id: this.params.data[0].id,
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
        this.params.refresh()
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
