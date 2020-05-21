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
import { getEnabledTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import { sizestr } from '@/utils/utils'

const storageType = {
  rotate: '机械硬盘',
  ssd: '固态硬盘',
  hybrid: '混合盘',
}

export default {
  name: 'PhysicalmachineDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
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
          title: '适配器',
        },
        {
          field: 'driver',
          title: '驱动',
          width: 80,
        },
        {
          field: 'model',
          title: '型号',
          showOverflow: 'ellipsis',
          minWidth: 100,
        },
        {
          field: 'rotate',
          title: '类型',
          width: 80,
          formatter: ({ cellValue, row }) => {
            if (cellValue === true) return '普通硬盘'
            return 'SSD'
          },
        },
        {
          field: 'size',
          title: '容量',
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
          title: 'mac地址',
          showOverflow: 'ellipsis',
          minWidth: 100,
          formatter: ({ cellValue, row }) => {
            if (cellValue) {
              return cellValue.toUpperCase()
            }
            return '-'
          },
        },
        {
          field: 'masklen',
          title: '子网掩码',
        },
        {
          field: 'nic_type',
          title: '类型',
        },
        {
          field: 'rate',
          title: '速率',
        },
      ],
      baseInfo: [
        getEnabledTableColumn(),
        getMaintenanceTableColumn(),
        {
          field: 'access_ip',
          title: 'IP',
        },
        getCopyWithContentTableColumn({
          field: 'server',
          title: '分配',
          hideField: true,
          slotCallback: row => {
            if (!row.server) return '-'
            return [
              <a onClick={ () => this.$emit('tab-change', 'baremetal-list') }>{row.server}</a>,
            ]
          },
        }),
        getCopyWithContentTableColumn({ field: 'server', title: '分配' }),
        {
          field: 'access_mac',
          title: 'mac地址',
          formatter: ({ cellValue, row }) => {
            if (cellValue) {
              return cellValue.toUpperCase()
            }
            return '-'
          },
        },
        {
          field: 'schedtags',
          title: '调度策略',
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
          title: 'host 版本',
        },
        {
          field: 'kvm_module',
          title: '硬件虚拟化',
          formatter: ({ cellData, row }) => {
            const kvmModuleMap = {
              'kvm-intel': 'Intel',
              'kvm-amd': 'AMD',
              'unsupport': '不支持',
            }
            if (!row.sys_info) return '-'
            return kvmModuleMap[row.sys_info['kvm_module']] || '-'
          },
        },
        {
          field: 'cdrom_boot',
          title: 'ISO启动',
          formatter: ({ cellData, row }) => {
            let ret = '-'
            if (row.ipmi_info && row.ipmi_info.cdrom_boot === 'true') {
              ret = '支持'
            } else {
              ret = '不支持'
            }
            return ret
          },
        },
      ],
      extraInfo: [
        {
          title: 'CPU',
          items: [
            {
              field: 'cpu_count',
              title: '核数',
              formatter: ({ cellValue }) => {
                return cellValue + '核'
              },
            },
            {
              field: 'node_count',
              title: '插槽数',
              formatter: ({ cellValue }) => {
                return cellValue + '个'
              },
            },
            {
              field: 'cpu_cmtbound',
              title: '超售比',
            },
            {
              field: 'cpu_commit_rate',
              title: '当前超售比例',
            },
            {
              field: 'cpu_desc',
              title: '描述',
            },
          ],
        },
        {
          title: '内存',
          items: [
            {
              field: 'mem_size',
              title: '容量',
              formatter: ({ cellValue, row }) => {
                return sizestr(cellValue, 'M', 1024)
              },
            },
            {
              field: 'mem_reserved',
              title: '系统预留',
              formatter: ({ cellValue, row }) => {
                return sizestr(cellValue, 'M', 1024)
              },
            },
            {
              field: 'mem_cmtbound',
              title: '超售比',
            },
            {
              field: 'mem_commit_rate',
              title: '当前超售比例',
            },
          ],
        },
        {
          title: '存储',
          items: [
            {
              field: 'storage_size',
              title: '容量',
              // formatter: ({ cellValue, row }) => {
              //   return sizestr(cellValue, 'M', 1024)
              // },
              slots: {
                default: ({ row }, h) => {
                  return [
                    <p>{ sizestr(row.storage_size, 'M', 1024) }<span style={{ color: '#aaa' }}>（物理机总容量）</span></p>,
                  ]
                },
              },
            },
            {
              field: 'storage_type',
              title: '类型',
              formatter: ({ cellValue, row }) => {
                return storageType[cellValue]
              },
            },
            {
              field: 'storage_commit_rate',
              title: '当前超售比例',
            },
            {
              field: 'storage_waste',
              title: '无效存储',
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
          title: '网络接口',
          field: 'nic_info',
          slots: {
            default: ({ row }, h) => {
              return [
                <vxe-grid class="mb-2" data={ row.nic_info } columns={ this.hostColumns } />,
              ]
            },
          },
        },
        {
          title: '品牌信息',
          items: [
            {
              field: 'manufacture',
              title: '名称',
              formatter: ({ cellValue, row }) => {
                return ((row.sys_info || {}).manufacture) || '-'
              },
            },
            {
              field: 'model',
              title: '型号',
              formatter: ({ cellValue, row }) => {
                return ((row.sys_info || {}).model) || '-'
              },
            },
            getCopyWithContentTableColumn({
              field: 'sn',
              title: '序列号',
            }),
          ],
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
