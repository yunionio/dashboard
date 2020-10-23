<template>
  <detail
    :on-manager="onManager"
    :data="itemData"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="hosts"
    status-module="host" />
</template>

<script>
import { getMaintenanceTableColumn } from '../utils/columns'
import { getEnabledTableColumn, getCopyWithContentTableColumn, getPublicScopeTableColumn } from '@/utils/common/tableColumn'
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'
import { sizestr } from '@/utils/utils'
import i18n from '@/locales'
import WindowsMixin from '@/mixins/windows'

const storageType = {
  rotate: i18n.t('compute.text_577'),
  ssd: i18n.t('compute.text_48'),
  hybrid: i18n.t('compute.text_578'),
}

export default {
  name: 'PhysicalmachineDetail',
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
    columns: Array,
  },
  data () {
    return {
      itemData: {
        status: 'ready',
        host_status: 'ready',
        enabled: true,
      },
      storageColumns: [
        {
          field: 'adapter',
          title: this.$t('compute.text_579'),
        },
        {
          field: 'driver',
          title: this.$t('compute.text_378'),
          width: 80,
        },
        {
          field: 'model',
          title: this.$t('compute.text_580'),
          showOverflow: 'ellipsis',
          minWidth: 100,
        },
        {
          field: 'rotate',
          title: this.$t('compute.text_175'),
          width: 80,
          formatter: ({ cellValue, row }) => {
            if (cellValue === true) return this.$t('compute.text_581')
            return 'SSD'
          },
        },
        {
          field: 'size',
          title: this.$t('compute.text_397'),
          formatter: ({ cellValue, row }) => {
            return sizestr(cellValue, 'M', 1024)
          },
        },
      ],
      hostColumns: [
        {
          field: 'ip_addr',
          title: 'IP',
          width: 100,
        },
        {
          field: 'mac',
          title: this.$t('compute.text_385'),
          showOverflow: 'ellipsis',
          minWidth: 100,
          formatter: ({ cellValue, row }) => {
            return cellValue || '-'
          },
        },
        {
          field: 'masklen',
          title: this.$t('compute.text_583'),
        },
        {
          field: 'nic_type',
          title: this.$t('compute.text_175'),
        },
        {
          field: 'rate',
          title: this.$t('compute.text_584'),
        },
      ],
      baseInfo: [
        getUserTagColumn({ onManager: this.onManager, resource: 'host', columns: () => this.columns, tipName: this.$t('compute.text_112') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'host', columns: () => this.columns, tipName: this.$t('compute.text_112') }),
        getPublicScopeTableColumn({ vm: this, resource: 'hosts' }),
        getEnabledTableColumn(),
        getMaintenanceTableColumn(),
        {
          field: 'access_ip',
          title: 'IP',
        },
        getCopyWithContentTableColumn({
          field: 'server',
          title: this.$t('compute.text_602'),
          hideField: true,
          slotCallback: row => {
            if (!row.server) return '-'
            return [
              <a onClick={ () => this.$emit('tab-change', 'baremetal-list') }>{row.server}</a>,
            ]
          },
        }),
        getCopyWithContentTableColumn({ field: 'server', title: this.$t('compute.text_602') }),
        {
          field: 'access_mac',
          title: this.$t('compute.text_385'),
          formatter: ({ cellValue, row }) => {
            return cellValue || '-'
          },
        },
        {
          field: 'schedtags',
          title: this.$t('compute.text_311'),
          formatter: ({ cellValue, row }) => {
            if (row.schedtags && row.schedtags.length > 0) {
              const schedtags = row.schedtags.map(v => v.name)
              return schedtags.join('，')
            }
            return '-'
          },
        },
        {
          field: 'version',
          title: this.$t('compute.text_585'),
        },
        {
          field: 'kvm_module',
          title: this.$t('compute.text_586'),
          formatter: ({ cellData, row }) => {
            const kvmModuleMap = {
              'kvm-intel': 'Intel',
              'kvm-amd': 'AMD',
              unsupport: this.$t('compute.text_587'),
            }
            if (!row.sys_info) return '-'
            return kvmModuleMap[row.sys_info.kvm_module] || '-'
          },
        },
        {
          field: 'cdrom_boot',
          title: this.$t('compute.text_588'),
          formatter: ({ cellData, row }) => {
            let ret = '-'
            if (row.ipmi_info && row.ipmi_info.cdrom_boot === 'true') {
              ret = this.$t('compute.text_589')
            } else {
              ret = this.$t('compute.text_587')
            }
            return ret
          },
        },
        {
          field: 'isolated_device_count',
          title: this.$t('compute.text_609'),
          slots: {
            default: ({ row }, h) => {
              return [
                <a onClick={ () => this.$emit('tab-change', 'gpu-list') }>{row.isolated_device_count || 0}</a>,
              ]
            },
          },
        },
      ],
      extraInfo: [
        {
          title: this.$t('compute.text_590'),
          items: [
            {
              field: 'manufacture',
              title: this.$t('compute.text_228'),
              formatter: ({ cellValue, row }) => {
                return ((row.sys_info || {}).manufacture) || '-'
              },
            },
            {
              field: 'model',
              title: this.$t('compute.text_580'),
              formatter: ({ cellValue, row }) => {
                return ((row.sys_info || {}).model) || '-'
              },
            },
            getCopyWithContentTableColumn({
              field: 'sn',
              title: this.$t('compute.text_591'),
            }),
          ],
        },
        {
          title: 'CPU',
          items: [
            {
              field: 'cpu_count',
              title: this.$t('compute.text_592'),
              formatter: ({ cellValue }) => {
                return cellValue + this.$t('compute.text_167')
              },
            },
            {
              field: 'node_count',
              title: this.$t('compute.text_593'),
              formatter: ({ cellValue }) => {
                return cellValue + this.$t('compute.text_200')
              },
            },
            {
              field: 'cpu_cmtbound',
              title: this.$t('compute.text_594'),
            },
            {
              field: 'cpu_commit_rate',
              title: this.$t('compute.text_859'),
            },
            {
              field: 'cpu_desc',
              title: this.$t('compute.text_596'),
            },
          ],
        },
        {
          title: this.$t('compute.text_369'),
          items: [
            {
              field: 'mem_size',
              title: this.$t('compute.text_397'),
              formatter: ({ cellValue, row }) => {
                return sizestr(cellValue, 'M', 1024)
              },
            },
            {
              field: 'mem_reserved',
              title: this.$t('compute.text_598'),
              formatter: ({ cellValue, row }) => {
                return sizestr(cellValue, 'M', 1024)
              },
            },
            {
              field: 'mem_cmtbound',
              title: this.$t('compute.text_594'),
            },
            {
              field: 'mem_commit_rate',
              title: this.$t('compute.text_859'),
            },
          ],
        },
        {
          title: this.$t('compute.text_99'),
          items: [
            {
              field: 'storage_size',
              title: this.$t('compute.text_397'),
              // formatter: ({ cellValue, row }) => {
              //   return sizestr(cellValue, 'M', 1024)
              // },
              slots: {
                default: ({ row }, h) => {
                  return [
                    <p>{ this.$t('compute.text_1321', { num: sizestr(row.storage_size, 'M', 1024) }) }</p>,
                  ]
                },
              },
            },
            {
              field: 'storage_type',
              title: this.$t('compute.text_175'),
              formatter: ({ cellValue, row }) => {
                return storageType[cellValue]
              },
            },
            {
              field: 'storage_commit_rate',
              title: this.$t('compute.text_859'),
            },
            {
              field: 'storage_waste',
              title: this.$t('compute.text_599'),
              formatter: ({ cellValue, row }) => {
                return sizestr(cellValue || 0, 'M', 1024)
              },
            },
            {
              title: '',
              field: 'storage_info',
              slots: {
                default: ({ row }, h) => {
                  return [
                    <vxe-grid class="mb-2" data={ row.storage_info } columns={ this.storageColumns } />,
                  ]
                },
              },
            },
          ],
        },
        {
          title: this.$t('compute.text_600'),
          field: 'nic_info',
          slots: {
            default: ({ row }, h) => {
              return [
                <vxe-grid class="mb-2" data={ row.nic_info } columns={ this.hostColumns } />,
              ]
            },
          },
        },
      ],
    }
  },
  created () {
    this.updateDetailData()
  },
  methods: {
    updateDetailData () {
      const hostManager = new this.$Manager('hosts')
      hostManager.get({ id: this.data.id })
        .then((res) => {
          this.itemData = res.data
        })
    },
  },
}
</script>
