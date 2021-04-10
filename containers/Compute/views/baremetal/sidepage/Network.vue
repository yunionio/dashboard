<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions" />
</template>

<script>
import { SERVER_TYPE } from '@Compute/constants'
import { getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import { findPlatform } from '@/utils/common/hypervisor'

export default {
  name: 'NetworkListForBaremetalSidepage',
  mixins: [WindowsMixin],
  props: {
    resId: String,
    data: {
      type: Object,
      required: true,
    },
    getParams: {
      type: Object,
    },
  },
  data () {
    const type = findPlatform(this.data.hypervisor)
    const isPublic = type === SERVER_TYPE.private
    const isPrivate = type === SERVER_TYPE.public
    return {
      list: this.$list.createList(this, {
        id: 'NetworkListForBaremetalSidepage',
        resource: 'networks',
        ctx: [['servers', this.resId]],
        idKey: 'network_id',
        getParams: this.getParams,
      }),
      columns: [
        {
          field: 'index',
          title: this.$t('compute.text_375'),
          width: 50,
          formatter: (data) => {
            return data.seq
          },
        },
        getCopyWithContentTableColumn({ field: 'network', title: this.$t('compute.text_384'), sortable: true }),
        getCopyWithContentTableColumn({ field: 'mac_addr', title: this.$t('compute.text_385'), sortable: true }),
        getCopyWithContentTableColumn({ field: 'ip_addr', title: this.$t('compute.text_386'), sortable: true }),
        getCopyWithContentTableColumn({ field: 'driver', title: this.$t('compute.text_378') }),
        {
          field: 'bw_limit',
          title: this.$t('compute.text_387'),
          width: 100,
          formatter: ({ row }) => {
            return `${row.bw_limit}Mbps`
          },
          slots: {
            header: ({ column }) => {
              return [
                <a-tooltip title={this.$t('compute.text_388')}>
                  <span class='mr-1'>{ column.title }</span>
                  <icon type="question" />
                </a-tooltip>,
              ]
            },
          },
        },
      ],
      singleActions: [
        {
          label: this.$t('compute.text_389'),
          action: (obj) => {
            this.createDialog('VmChangeBandwidthDialog', {
              data: [obj],
              columns: this.columns,
              list: this.list,
              refresh: this.refresh,
            })
          },
        },
        {
          label: this.$t('compute.text_390'),
          action: (obj) => {
            this.createDialog('VmChangeIpDialog', {
              data: [obj],
              columns: this.columns,
              list: this.list,
              zone: this.data.zone_id,
              resId: this.resId,
              refresh: this.refresh,
            })
          },
          meta: (obj) => {
            const ret = {
              validate: false,
              tooltip: null,
            }
            if (isPrivate || isPublic) {
              ret.tooltip = this.$t('compute.text_391')
              return ret
            }
            ret.validate = true
            return ret
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
