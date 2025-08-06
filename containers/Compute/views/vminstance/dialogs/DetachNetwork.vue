<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('compute.nic')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form-item>
        <a-checkbox v-model="syncConfigImmediately" :disabled="!isVmPoweroff">
          {{ $t('compute.nics.sync_config_immediately') }}
        </a-checkbox>
      </a-form-item>
      <a-form-item>
        <a-checkbox v-model="forceRemove" :disabled="!isVmPoweroff">
          {{ $t('compute.nics.force_remove') }}
        </a-checkbox>
      </a-form-item>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'VmDetachNetworkDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.$t('compute.detach_network_title'),
      syncConfigImmediately: true,
      forceRemove: false,
    }
  },
  computed: {
    columns () {
      const showFields = ['ifname', 'ip_addr', 'mac_addr']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
    isVmPoweroff () {
      return this.params.server.power_states === 'off'
    },
  },
  methods: {
    async doDetachSubmit () {
      const manager = new this.$Manager('servers')
      const params = {
        disable_sync_config: !this.syncConfigImmediately,
        force: this.forceRemove,
      }
      if (this.params.data[0].ip_addr) {
        params.ip_addr = this.params.data[0].ip_addr
      }
      if (this.params.data[0].ip6_addr) {
        params.ip6_addr = this.params.data[0].ip6_addr
      }
      return manager.performAction({
        id: this.params.data[0].guest_id,
        action: 'detachnetwork',
        data: params,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.doDetachSubmit()
        this.loading = false
        this.params.refresh()
        this.$bus.$emit('VMInstanceListSingleRefresh', [this.params.data[0].guest_id, Object.values(expectStatus.server).flat()])
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
