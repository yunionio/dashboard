<template>
    <vxe-grid class="mb-2" :data="data.nic_info" :columns="columns" />
</template>

<script>
import { getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'NetworkList',
  mixins: [WindowsMixin],
  props: {
    resId: String,
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'networks',
        ctx: [['hosts', this.resId]],
        getParams: this.getParams,
      }),
      columns: [
        {
          field: 'index',
          title: this.$t('compute.text_375'),
          formatter: ({ row }) => {
            return row.index
          },
        },
        getCopyWithContentTableColumn({ field: 'mac', title: this.$t('compute.text_385') }),
        {
          field: 'nic_type',
          title: this.$t('compute.text_860'),
          width: 80,
          formatter: ({ row }) => {
            if (row.nic_type === 'admin') {
              return this.$t('compute.text_861')
            } else if (row.nic_type === 'ipmi') {
              return this.$t('compute.text_862')
            } else {
              return '-'
            }
          },
        },
        getCopyWithContentTableColumn({ field: 'ip_addr', title: this.$t('compute.text_386') }),
        getCopyWithContentTableColumn({ field: 'net', title: this.$t('compute.text_106') }),
        getCopyWithContentTableColumn({ field: 'wire', title: this.$t('compute.text_844') }),
        {
          field: 'action',
          title: this.$t('compute.text_863'),
          slots: {
            default: ({ row }, h) => {
              const ret = []
              ret.push(
                <a-button type="link" onClick = {() => this.setWire(row)} disabled={ !!row.ip_addr }>{ this.$t('compute.text_843') }</a-button>,
              )
              return ret
            },
          },
        },
      ],
    }
  },
  methods: {
    setWire (obj) {
      obj = {
        ...obj,
        hostId: this.data.id,
      }
      this.createDialog('HostSetWireDialog', {
        data: [obj],
        columns: this.columns,
        list: this.list,
      })
    },
  },
}
</script>
