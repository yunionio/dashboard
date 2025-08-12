<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions" />
</template>

<script>
import {
  getCopyWithContentTableColumn,
  getStatusTableColumn,
  getRegionTableColumn,
  getIpsTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'
import { sizestr } from '@/utils/utils'

export default {
  name: 'DiskListForVmSnapshotPolicySidePage',
  mixins: [WindowsMixin, ListMixin],
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
        id: 'ServerListForVmSnapshotPolicySidePage',
        resource: 'servers',
        steadyStatus: Object.values(expectStatus.server).flat(),
        getParams: { ...this.getParams, snapshotpolicy_id: this.resId },
        filterOptions: {
          name: {
            label: this.$t('compute.text_228'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
      }),
      columns: [
        getCopyWithContentTableColumn({
          field: 'name',
          title: this.$t('compute.text_228'),
          hideField: true,
          slotCallback: row => {
            return [<side-page-trigger permission="servers_get" name="VmInstanceSidePage" id={row.id} vm={this}>{ row.name }</side-page-trigger>]
          },
        }),
        getStatusTableColumn({ statusModule: 'server' }),
        getIpsTableColumn({
          field: 'ips',
          title: 'IP',
          vm: this,
          sortable: true,
          hidden: () => {
            return this.$isScopedPolicyMenuHidden('server_hidden_columns.ips')
          },
        }),
        {
          field: 'vcpu_count',
          title: 'CPU',
          sortable: true,
          minWidth: 80,
          slots: {
            default: ({ row }) => {
              if (row.vcpu_count) {
                return [<list-body-cell-wrap row={{ row }} hide-field field="vcpu_count">{row.vcpu_count}</list-body-cell-wrap>]
              }
              return []
            },
          },
          hidden: () => {
            return this.$isScopedPolicyMenuHidden('server_hidden_columns.vcpu_count')
          },
        },
        {
          field: 'vmem_size',
          title: this.$t('table.title.vmem_size'),
          sortable: true,
          minWidth: 80,
          slots: {
            default: ({ row }) => {
              if (row.vmem_size) {
                const config = (row.vmem_size / 1024) + 'G'
                return [<list-body-cell-wrap row={{ row }} hide-field field="vmem_size">{config}</list-body-cell-wrap>]
              }
              return []
            },
          },
          formatter: ({ row }) => {
            if (row.vmem_size) {
              const config = (row.vmem_size / 1024) + 'G'
              return config
            }
            return ''
          },
          hidden: () => {
            return this.$isScopedPolicyMenuHidden('server_hidden_columns.vmem_size')
          },
        },
        {
          field: 'disk',
          title: this.$t('table.title.disk'),
          sortable: true,
          minWidth: 80,
          slots: {
            default: ({ row }) => {
              if (this.isPreLoad && !row.disk) return [<data-loading />]
              const config = row.disk ? sizestr(row.disk, 'M', 1024) : ''
              return [<list-body-cell-wrap row={{ row }} hide-field field="disk">{config}</list-body-cell-wrap>]
            },
          },
          formatter: ({ row }) => {
            if (!row.disk) return ''
            const config = row.disk ? sizestr(row.disk, 'M', 1024) : ''
            return config
          },
          hidden: () => {
            return this.$isScopedPolicyMenuHidden('server_hidden_columns.disk')
          },
        },
        getRegionTableColumn(),
      ],
      groupActions: [
        {
          label: this.$t('compute.text_723'),
          action: () => {
            this.createDialog('UnbindResourcesDialog', {
              data: this.list.selectedItems,
              resourceType: 'server',
              columns: this.columns,
              title: this.$t('compute.text_723'),
              resId: this.resId,
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length > 0,
            }
          },
        },
      ],
      singleActions: [
        {
          label: this.$t('compute.text_723'),
          action: obj => {
            this.createDialog('UnbindResourcesDialog', {
              resourceType: 'server',
              data: [obj],
              columns: this.columns,
              title: this.$t('compute.text_723'),
              resId: this.resId,
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: obj => {
            const ret = {
              validate: true,
              tooltip: null,
            }
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
