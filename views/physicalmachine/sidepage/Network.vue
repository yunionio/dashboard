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
          title: '序号',
          formatter: ({ row }) => {
            return row.index
          },
        },
        getCopyWithContentTableColumn({ field: 'mac', title: 'MAC地址' }),
        {
          field: 'nic_type',
          title: '网卡类型',
          width: 80,
          formatter: ({ row }) => {
            if (row.nic_type === 'admin') {
              return '管理口'
            } else if (row.nic_type === 'ipmi') {
              return '带外口'
            } else {
              return '-'
            }
          },
        },
        getCopyWithContentTableColumn({ field: 'ip_addr', title: 'IP地址' }),
        getCopyWithContentTableColumn({ field: 'net', title: 'IP子网' }),
        getCopyWithContentTableColumn({ field: 'wire', title: '二层网络' }),
        {
          field: 'action',
          title: '操作',
          slots: {
            default: ({ row }, h) => {
              const ret = []
              ret.push(
                <a-button type="link" onClick = {() => this.setWire(row)} disabled={ !!row.ip_addr }>设置二层网络</a-button>,
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
