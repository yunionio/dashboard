<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions" />
</template>

<script>
import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { sizestr } from '@/utils/utils'
import {
  getProjectTableColumn,
  getRegionTableColumn,
  getStatusTableColumn,
  getBrandTableColumn,
  getCopyWithContentTableColumn,
  getIpsTableColumn,
  getTagTableColumn,
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'
import SystemIcon from '@/sections/SystemIcon'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

const commonUnabled = (value, statusArr = ['sched_fail', 'net_fail', 'disk_fail']) => {
  return statusArr.includes(value.status)
}

export default {
  name: '',
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
        resource: 'servers',
        getParams: {
          'filter.0': `id.equals(${this.data.guest_id})`,
        },
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
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          addLock: true,
          addBackup: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'VmInstanceSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'server', columns: () => this.columns }),
        getIpsTableColumn({ field: 'ip', title: 'IP' }),
        {
          field: 'instance_type',
          title: this.$t('compute.text_295'),
          showOverflow: 'ellipsis',
          minWidth: 120,
          sortable: true,
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
          title: this.$t('table.column.title.os'),
          width: 50,
          slots: {
            default: ({ row }) => {
              let name = (row.metadata && row.metadata.os_distribution) ? row.metadata.os_distribution : row.os_type || ''
              if (name.includes('Windows') || name.includes('windows')) {
                name = 'Windows'
              }
              const version = (row.metadata && row.metadata.os_version) ? `${row.metadata.os_version}` : ''
              const tooltip = (version.includes(name) ? version : `${name} ${version}`) || this.$t('compute.text_339') // 去重
              return [
                <SystemIcon tooltip={ tooltip } name={ name } />,
              ]
            },
          },
        },
        {
          field: 'password',
          title: this.$t('compute.text_340'),
          width: 50,
          slots: {
            default: ({ row }) => {
              return [<PasswordFetcher serverId={ row.id } resourceType='servers' />]
            },
          },
        },
        {
          field: 'secgroups',
          title: this.$t('compute.text_105'),
          width: 80,
          showOverflow: 'ellipsis',
          formatter: ({ cellValue = [] }) => {
            return cellValue.map(item => item.name).join(',')
          },
        },
        {
          field: 'billing_type',
          title: this.$t('compute.text_498'),
          width: 100,
          showOverflow: 'ellipsis',
          slots: {
            default: ({ row }) => {
              const ret = []
              if (row.billing_type === 'postpaid') {
                ret.push(<div style={{ color: '#0A1F44' }}>按量付费</div>)
              } else if (row.billing_type === 'prepaid') {
                ret.push(<div style={{ color: '#0A1F44' }}>包年包月</div>)
              }
              if (row.expired_at) {
                const dateArr = this.$moment(row.expired_at).fromNow().split(' ')
                const date = dateArr.join('')
                const seconds = this.$moment(row.expired_at).diff(new Date()) / 1000
                const textColor = seconds / 24 / 60 / 60 < 7 ? '#DD2727' : '#53627C'
                const text = seconds < 0 ? this.$t('compute.text_499') : this.$t('compute.text_500', [date.substring(0, date.length - 1)])
                ret.push(<div style={{ color: textColor }}>{ text }</div>)
              }
              return ret
            },
          },
        },
        getStatusTableColumn({ statusModule: 'server' }),
        getCopyWithContentTableColumn({ field: 'vpc', title: 'VPC' }),
        getCopyWithContentTableColumn({ field: 'host', title: this.$t('compute.text_111'), sortable: true }),
        getProjectTableColumn(),
        getBrandTableColumn(),
        getRegionTableColumn(),
      ],
      singleActions: [
        {
          label: this.$t('compute.text_272'),
          permission: 'server_perform_start',
          action: (obj) => {
            this.list.onManager('performAction', {
              steadyStatus: 'running',
              id: obj.id,
              managerArgs: {
                action: 'start',
              },
            })
          },
          meta: (obj) => {
            return {
              validate: obj.status === 'ready' && !commonUnabled(obj),
            }
          },
        },
        {
          label: this.$t('compute.text_273'),
          permission: 'server_perform_stop',
          action: (obj) => {
            this.createDialog('VmShutDownDialog', {
              data: [obj],
              columns: this.columns,
              list: this.list,
            })
          },
          meta: (obj) => {
            return {
              validate: obj.status === 'running' && !commonUnabled(obj),
            }
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('detail')
    this.list.fetchData()
  },
}
</script>
