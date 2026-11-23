<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.title }}</div>
    <div slot="body">
      <a-empty v-if="isEmpty" />
      <a-tag
        v-for="(item, idx) in params.data"
        :key="idx"
        :color="colors[idx % 7]"
        class="mb-2"
        style="width: '250px'">
        <template v-if="isNetwork">
          {{ item.ip_addr }}
        </template>
        <template v-else-if="isPort">
          {{$t('compute.port_mappings.port.title')}}: {{item.port}} = {{$t('compute.port_mappings.host_port.title')}}: {{item.host_port}} ({{item.protocol.toUpperCase()}})
        </template>
      </a-tag>
    </div>
    <div slot="footer">
      <a-button v-if="canSetPortMapping" class="mr-2" @click="openSetPortMappingDialog">{{ $t('common.setting') }}</a-button>
      <a-button type="primary" @click="cancelDialog">{{ $t('dialog.ok') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { HYPERVISORS_MAP } from '@/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ViewContentDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      colors: ['pink', 'red', 'orange', 'green', 'cyan', 'blue', 'purple'],
    }
  },
  computed: {
    isEmpty () {
      return !this.params.data?.length > 0
    },
    isNetwork () {
      return this.params.type === 'network'
    },
    isPort () {
      return this.params.type === 'port'
    },
    canSetPortMapping () {
      if (!this.isPort || !this.params.nic) return false
      if (this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_set_port_mapping')) return false
      const server = this.params.server
      if (!server) return false
      const supportPortMapping = [HYPERVISORS_MAP.kvm.key, HYPERVISORS_MAP.pod.key].includes(server.hypervisor)
      if (!supportPortMapping) return false
      if (server.status === 'set_portmapping') return false
      if (!['running', 'ready'].includes(server.status)) return false
      return true
    },
  },
  methods: {
    openSetPortMappingDialog () {
      this.cancelDialog()
      this.$nextTick(() => {
        this.createDialog('VmSetPortMappingDialog', {
          resId: this.params.resId,
          data: [this.params.nic],
          columns: this.params.columns,
          refresh: this.params.refresh,
          listRefresh: this.params.listRefresh,
        })
      })
    },
  },
}
</script>
