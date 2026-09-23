<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('compute.text_902') }}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <template v-slot:message>
          <div>{{ $t(alerts[0], [$t('dictionary.instancegroup'), $t('dictionary.instancegroup')]) }}</div>
          <div class="mt-2">{{ $t(alerts[1], [$t('dictionary.instancegroup')]) }}</div>
        </template>
      </a-alert>
      <dialog-selected-tips :name="$t('dictionary.instancegroup')" :count="1" :action="$t('compute.text_902')" />
      <a-form-item :label="resourceName" v-bind="formItemLayout">
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
          :select-props="{ allowClear: true, placeholder: $t('compute.text_702', [resourceName]), mode: 'multiple' }" />
      </a-form-item>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'InstanceGroupBindGuestsDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      serversInitLoaded: false,
      bindedServersLoaded: false,
      bindedServerIds: [],
      selectedServers: [],
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
    instanceGroup () {
      return this.params.data || {}
    },
    hypervisor () {
      return this.params.hypervisor
    },
    resourceName () {
      return this.params.resourceName
    },
    alerts () {
      return this.params.alerts || ['compute.text_704', 'compute.text_707']
    },
    serversParams () {
      return {
        scope: this.scope,
        project: this.instanceGroup.tenant_id,
        limit: 20,
        filter: [`hypervisor.in(${this.hypervisor})`],
      }
    },
  },
  created () {
    this.fetchBindedServers()
  },
  methods: {
    serversMapper (data) {
      return data.filter(item => {
        const isRunning = item.status === 'running'
        const isReady = item.status === 'ready'
        const notHa = !item.backup_host_id
        const isOneCloud = item.brand === 'OneCloud'
        const notBound = !this.bindedServerIds.includes(item.id)
        return (isRunning || isReady) && notHa && isOneCloud && notBound
      })
    },
    async fetchBindedServers () {
      const manager = new this.$Manager('servers')
      try {
        const { data: { data = [] } } = await manager.list({
          params: {
            scope: this.scope,
            group: this.instanceGroup.id,
            filter: `hypervisor.in(${this.hypervisor})`,
            limit: 0,
          },
        })
        this.bindedServerIds = data.map(item => item.id)
      } catch (error) {
        throw error
      } finally {
        this.bindedServersLoaded = true
      }
    },
    handleSelectChange (val) {
      this.selectedServers = val
    },
    async handleConfirm () {
      const ids = (this.selectedServers || []).filter(item => !!item)
      if (!ids.length) return
      this.loading = true
      const manager = new this.$Manager('instancegroups')
      const data = {}
      ids.forEach((id, i) => {
        data[`guest.${i}`] = id
      })
      try {
        await manager.performAction({
          id: this.instanceGroup.id,
          action: 'bind-guests',
          data,
        })
        this.params.refresh && this.params.refresh()
        this.$bus.$emit('InstanceGroupListRefresh', this.instanceGroup.id)
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
