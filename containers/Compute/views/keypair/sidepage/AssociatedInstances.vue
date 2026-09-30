<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :list="list"
    :columns="columns"
    :show-single-actions="false"
    :export-data-options="exportDataOptions" />
</template>

<script>
import SystemIcon from '@/sections/SystemIcon'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'
import { sizestr } from '@/utils/utils'
import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getTagTableColumn,
  getIpsTableColumn,
  getBrandTableColumn,
  getBillingTableColumn,
  getProjectTableColumn,
  getRegionTableColumn,
  getAccountTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import {
  getNameFilter,
  getStatusFilter,
  getBrandFilter,
  getTenantFilter,
  getAccountFilter,
  getIpFilter,
} from '@/utils/common/tableFilter'

export default {
  name: 'KeypairAssociatedInstances',
  mixins: [WindowsMixin, ListMixin],
  props: {
    id: String,
    resId: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'servers',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.server).flat(),
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter('server'),
          brand: getBrandFilter('compute_engine_brands'),
          ips: getIpFilter(),
          tenant: getTenantFilter(),
          account: getAccountFilter(),
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          onManager: this.onManager,
          hideField: true,
          addLock: true,
          showDesc: false,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'instance_resource_type',
          title: this.$t('compute.text_266'),
          minWidth: 100,
          formatter: ({ row }) => this.getInstanceTypeLabel(row),
        },
        getStatusTableColumn({ statusModule: 'server', vm: this }),
        getStatusTableColumn({
          field: 'power_states',
          title: this.$t('compute.power_states'),
          statusModule: 'server',
        }),
        getTagTableColumn({ onManager: this.onManager, resource: 'server', columns: () => this.columns }),
        getIpsTableColumn({ field: 'ips', title: 'IP', vm: this }),
        {
          field: 'instance_type',
          title: this.$t('table.title.flavor'),
          showOverflow: 'ellipsis',
          minWidth: 120,
          slots: {
            default: ({ row }) => {
              const ret = []
              if (row.instance_type) {
                ret.push(<div class='text-truncate' style={{ color: '#0A1F44' }}>{ row.instance_type }</div>)
              }
              const config = row.vcpu_count + 'C' + sizestr(row.vmem_size, 'M', 1024) + (row.disk ? sizestr(row.disk, 'M', 1024) : '')
              return ret.concat(<div class='text-truncate' style={{ color: '#53627C' }}>{ config }</div>)
            },
          },
        },
        {
          field: 'os_type',
          title: this.$t('table.title.os'),
          width: 50,
          slots: {
            default: ({ row }) => {
              let name = (row.metadata && row.metadata.os_distribution) ? row.metadata.os_distribution : row.os_type || ''
              if (name.includes('Windows') || name.includes('windows')) {
                name = 'Windows'
              }
              const version = (row.metadata && row.metadata.os_version) ? `${row.metadata.os_version}` : ''
              const tooltip = (version.includes(name) ? version : `${name} ${version}`) || this.$t('compute.text_339')
              return [
                <SystemIcon tooltip={ tooltip } name={ name } />,
              ]
            },
          },
        },
        getBrandTableColumn(),
        getBillingTableColumn({ vm: this }),
        getProjectTableColumn(),
        getRegionTableColumn(),
        getAccountTableColumn(),
        getTimeTableColumn(),
      ],
    }
  },
  computed: {
    exportDataOptions () {
      return {
        title: this.$t('compute.associated_instances'),
        downloadType: 'local',
        items: this.columns,
      }
    },
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParam () {
      return {
        details: true,
        with_meta: true,
        keypair_id: this.resId,
        ...this.getParams,
      }
    },
    getInstanceTypeLabel (row) {
      const hypervisor = (row.hypervisor || '').toLowerCase()
      if (hypervisor === 'baremetal') {
        return this.$t('compute.text_92')
      }
      if (hypervisor === 'pod' || hypervisor === 'container') {
        return this.$t('license.feature.pod')
      }
      return this.$t('compute.text_91')
    },
    getSidePageByHypervisor (hypervisor) {
      const key = (hypervisor || '').toLowerCase()
      if (key === 'pod' || key === 'container') {
        return 'VmContainerInstanceSidePage'
      }
      if (key === 'baremetal') {
        return 'BaremetalSidePage'
      }
      return 'VmInstanceSidePage'
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, this.getSidePageByHypervisor(row.hypervisor), {
        id: row.id,
        resource: 'servers',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.server).flat(),
      }, {
        list: this.list,
      })
    },
  },
}
</script>
