<template>
  <page-list
    :list="list"
    :columns="columns"
    :singleActions="singleActions"
    :group-actions="groupActions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'NetworkIpMacs',
  mixins: [WindowsMixin, ListMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'NetworkIpMacsForNetworkSidePage',
        resource: 'network_ip_macs',
        getParams: {
          details: true,
          network_id: this.data.id,
        },
      }),
      columns: [
        {
          field: 'ip_addr',
          title: 'IP',
        },
        {
          field: 'mac_addr',
          title: this.$t('network.text_228'),
        },
      ],
      singleActions: [
        {
          label: this.$t('common.edit'),
          action: (obj) => {
            this.createDialog('NetworkIpMacsCreateDialog', {
              data: [this.data],
              editData: [obj],
              name: this.$t('dictionary.network'),
              ok: () => {
                this.list.fetchData()
              },
            })
          },
        },
        {
          label: this.$t('common.delete'),
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              columns: this.columns,
              title: this.$t('common.delete'),
              name: this.$t('network.mac_ip.mapping_table'),
              onManager: this.onManager,
            })
          },
          meta: (obj) => {
            if (!this.$getDeleteResult(obj).validate) {
              return {
                validate: false,
                tooltip: this.$getDeleteResult(obj).tooltip,
              }
            }
            return {
              validate: true,
              tooltip: '',
            }
          },
        },
      ],
      groupActions: [
        {
          label: this.$t('common.create'),
          action: () => {
            this.createDialog('NetworkIpMacsCreateDialog', {
              data: [this.data],
              name: this.$t('dictionary.network'),
              ok: () => {
                this.list.fetchData()
              },
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: true,
            }
          },
        },
        {
          label: this.$t('network.mac_ip.import_mapping_table'),
          action: () => {
            this.createDialog('ImportNetworkIpMacsDialog', {
              data: [this.data],
              ok: () => {
                this.list.fetchData()
              },
            })
          },
        },
        {
          label: this.$t('common.delete'),
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('common.delete'),
              name: this.$t('network.mac_ip.mapping_table'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
