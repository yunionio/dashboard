<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="hosts"
    status-module="host" />
</template>

<script>
import { getIsolatedDeviceCountColumns } from '../utils/columns'
import WindowsMixin from '@/mixins/windows'
import { getEnabledTableColumn, getBrandTableColumn, getCopyWithContentTableColumn, getStatusTableColumn } from '@/utils/common/tableColumn'
import { sizestr } from '@/utils/utils'

const storageType = {
  rotate: '机械硬盘',
  ssd: '固态硬盘',
  hybrid: '混合盘',
}

export default {
  name: 'HostDetail',
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
    columns: {
      type: Array,
      required: true,
    },
    refresh: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      // itemData: {
      //   status: 'ready',
      //   host_status: 'ready',
      //   enabled: true,
      // },
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
        {
          field: 'slot',
          title: '插槽序号',
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
          title: 'MAC地址',
          showOverflow: 'ellipsis',
          minWidth: 100,
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
        getBrandTableColumn(),
        getEnabledTableColumn(),
        {
          field: 'access_ip',
          title: 'IP',
        },
        {
          field: 'access_mac',
          title: 'MAC地址',
        },
        getStatusTableColumn({ field: 'host_status', statusModule: 'host_status', title: '服务' }),
        {
          field: 'nonsystem_guests',
          title: '#VM',
          width: 60,
          slots: {
            default: ({ row }, h) => {
              if (row.nonsystem_guests <= 0) return row.nonsystem_guests
              const ret = [
                <a onClick={ () => this.$emit('tab-change', 'vminstance-list') }>{row.nonsystem_guests}</a>,
              ]
              return ret
            },
          },
        },
        {
          field: 'access_mac',
          title: 'MAC地址',
        },
        {
          field: 'schedtags',
          title: '调度标签',
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
          slots: {
            default: ({ row, cellValue }) => {
              // if (row.brand && row.brand.toLowerCase() === 'onecloud') {
              //   const data = row.version.split('/')[1].split('^')[0]
              //   return [
              //     <div class='text-truncate'>
              //       { data }
              //     </div>,
              //   ]
              // }
              return [
                <div class='text-truncate'>
                  <list-body-cell-wrap copy row={ row } field="version" title={ cellValue } />
                </div>,
              ]
            },
          },
        },
        {
          field: 'kvm_module',
          title: '硬件虚拟化',
          formatter: ({ cellData, row }) => {
            const kvmModuleMap = {
              'kvm-intel': 'Intel',
              'kvm-amd': 'AMD',
              unsupport: '不支持',
            }
            if (!row.sys_info) return '-'
            return kvmModuleMap[row.sys_info.kvm_module] || '-'
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
        getIsolatedDeviceCountColumns(),
      ],
      extraInfo: [
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
              field: 'cpu_commit_bound',
              title: '超售比',
              slots: {
                default: ({ row }, h) => {
                  if (row.cpu_commit_bound) {
                    return [
                      <a class="mem-edit-item" onClick={this.openHostAdjustOversoldRatioDialog}>{row.cpu_commit_bound} <a class="edit-icon"><a-icon type='edit' /></a></a>,
                    ]
                  }
                  return '-'
                },
              },
            },
            {
              field: 'cpu_commit_rate',
              title: '当前超售比率',
            },
            {
              field: 'cpu_desc',
              title: '描述',
            },
            {
              field: 'reserved_cpu',
              title: 'GPU卡预留',
              slots: {
                default: ({ row }, h) => {
                  const cpu = row.reserved_resource_for_gpu && row.reserved_resource_for_gpu.reserved_cpu
                  if (cpu) {
                    return [
                      <a onClick={ () => this.$emit('tab-change', 'gpu-list') }>{cpu}核</a>,
                    ]
                  }
                  return '-'
                },
              },
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
              field: 'mem_commint_bound',
              title: '超售比',
              slots: {
                default: ({ row }, h) => {
                  if (row.mem_commint_bound) return [<a class="mem-edit-item" onClick={this.openHostAdjustOversoldRatioDialog}>{row.mem_commint_bound}<a class="edit-icon"><a-icon type='edit' /></a></a>]
                  return '-'
                },
              },
            },
            {
              field: 'mem_commit_rate',
              title: '当前超售比率',
            },
            {
              field: 'reserved_memory',
              title: 'GPU卡预留',
              slots: {
                default: ({ row }, h) => {
                  const memory = row.reserved_resource_for_gpu && row.reserved_resource_for_gpu.reserved_memory
                  if (memory) {
                    return [
                      <a onClick={ () => this.$emit('tab-change', 'gpu-list') }>{ sizestr(memory, 'M', 1024) }</a>,
                    ]
                  }
                  return '-'
                },
              },
            },
          ],
        },
        {
          title: '存储',
          items: [
            {
              field: 'storage',
              title: '容量',
              formatter: ({ cellValue, row }) => {
                return sizestr(cellValue, 'M', 1024)
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
              title: '当前超售比率',
            },
            {
              field: 'reserved_storage',
              title: 'GPU卡预留',
              slots: {
                default: ({ row }, h) => {
                  const storage = row.reserved_resource_for_gpu && row.reserved_resource_for_gpu.reserved_storage
                  if (storage) {
                    return [
                      <a onClick={ () => this.$emit('tab-change', 'gpu-list') }>{ sizestr(storage, 'M', 1024) }</a>,
                    ]
                  }
                  return '-'
                },
              },
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
      ],
    }
  },
  // created () {
  //   this.updateDetailData()
  // },
  methods: {
    // updateDetailData () {
    //   const hostManager = new this.$Manager('hosts')
    //   hostManager.get({ id: this.data.id })
    //     .then((res) => {
    //       this.itemData = res.data
    //     })
    // },
    openHostAdjustOversoldRatioDialog () {
      this.createDialog('HostAdjustOversoldRatioDialog', {
        data: [this.data],
        columns: this.columns,
        onManager: this.onManager,
        name: this.$t('dictionary.host'),
        refresh: this.refresh,
      })
    },
  },
}
</script>
<style lang="scss">
  .mem-edit-item {
    .edit-icon {
      display: none;
    }
    &:hover .edit-icon {
      display: inline;
    }
  }
</style>
