<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :extra-info="extraInfo"
    :base-info="baseInfo"
    status-module="server"
    resource="servers" />
</template>

<script>
import { ALL_STORAGE, SERVER_TYPE } from '@Compute/constants/index'

import {
  getCopyWithContentTableColumn,
  getBrandTableColumn,
  getSwitchTableColumn,
  getBillingTypeTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import { findPlatform } from '@/utils/common/hypervisor'

export default {
  name: 'VmInstanceDetail',
  mixins: [WindowsMixin],
  props: {
    onManager: {
      type: Function,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        {
          field: 'keypair',
          title: '关联密钥',
        },
        getBrandTableColumn(),
        getBillingTypeTableColumn(),
      ],
    }
  },
  computed: {
    diskInfos () {
      const disksInfo = this.data.disks_info
      if (!disksInfo) return {}
      const dataDisk = {}
      const sysDisk = {}
      let image = '-'
      let imageId
      let sysDisks = disksInfo.filter(v => v.disk_type === 'sys')
      if (sysDisks && sysDisks.length === 0) {
        sysDisks = disksInfo.filter(v => v.index === 0)
      }
      const dataDisks = disksInfo.filter(v => v.index !== 0)
      if (sysDisks && sysDisks.length > 0) {
        const sysKey = sysDisks[0].storage_type
        image = sysDisks[0].image || '-'
        imageId = sysDisks[0].image_id
        sysDisk[sysKey] = this._dealSize(sysDisks)
      }
      if (dataDisks && dataDisks.length > 0) {
        for (const k in ALL_STORAGE) {
          const e = ALL_STORAGE[k]
          const sameType = dataDisks.filter(v => v.storage_type === e.value)
          if (sameType && sameType.length) {
            dataDisk[k] = this._dealSize(sameType)
          }
        }
      }
      if (this.data.cdrom && dataDisks.length > 0) {
        image = dataDisks[0].image
        imageId = dataDisks[0].image_id
      }
      return {
        sysDisk: this._diskStringify(sysDisk),
        dataDisk: this._diskStringify(dataDisk),
        image,
        imageId,
      }
    },
    extraInfo () {
      return [
        {
          title: '配置信息',
          items: [
            {
              field: 'os_type',
              title: '操作系统',
              formatter: ({ row }) => {
                const distribution = (row.metadata && row.metadata.os_distribution) ? row.metadata.os_distribution : row.os_type
                const { os_version: version = '' } = row.metadata || {}
                return distribution + (version === '-' ? '' : version)
              },
            },
            getCopyWithContentTableColumn({
              field: 'ips',
              title: 'IP',
              hideField: true,
              slotCallback: row => {
                if (!row.ips) return '-'
                return [
                  <a onClick={ () => this.$emit('tab-change', 'network-list-for-vm-instance-sidepage') }>{row.ips}</a>,
                ]
              },
            }),
            getCopyWithContentTableColumn({
              field: 'image',
              title: '系统镜像',
              hideField: true,
              message: this.diskInfos.image,
              slotCallback: row => {
                if (!this.diskInfos.image || this.diskInfos.image === '-') return '-'
                return [
                  <side-page-trigger permission='images_get' name='SystemImageSidePage' id={this.diskInfos.imageId} vm={this}>{ this.diskInfos.image }</side-page-trigger>,
                ]
              },
            }),
            {
              field: 'host',
              title: '宿主机',
              sortable: true,
              showOverflow: 'ellipsis',
              minWidth: 100,
              slots: {
                default: ({ row }) => {
                  if (findPlatform(row.hypervisor, 'hypervisor') === SERVER_TYPE.public) {
                    return '-'
                  }
                  const text = row.host || '-'
                  return [
                    <list-body-cell-wrap copy hideField={true} field='host' row={row} message={text}>
                      <side-page-trigger permission='hosts_get' name='HostSidePage' id={row.host_id} vm={this}>{row.host}</side-page-trigger>
                    </list-body-cell-wrap>,
                  ]
                },
              },
            },
            {
              field: 'secgroups',
              title: '安全组',
              slots: {
                default: ({ row }) => {
                  if (!row.secgroups) return '-'
                  return row.secgroups.map((item) => {
                    return <list-body-cell-wrap copy hideField={true} field='name' row={item} message={item.name}>
                      <side-page-trigger permission='secgroups_get' name='SecGroupSidePage' id={item.id} vm={this}>{ item.name }</side-page-trigger>
                    </list-body-cell-wrap>
                  })
                },
              },
            },
            getCopyWithContentTableColumn({
              field: 'vpc',
              title: 'VPC',
              hideField: true,
              slotCallback: row => {
                if (!row.vpc) return '-'
                return [
                  <side-page-trigger permission='vpcs_get' name='VpcSidePage' id={row.vpc_id} vm={this}>{ row.vpc }</side-page-trigger>,
                ]
              },
            }),
            {
              field: 'vcpu_count',
              title: 'CPU',
              formatter: ({ row }) => {
                return row.vcpu_count + '核'
              },
            },
            {
              field: 'vmem_size',
              title: '内存',
              formatter: ({ row }) => {
                return (row.vmem_size / 1024) + 'GB'
              },
            },
            {
              field: 'sysDisk',
              title: '系统盘',
              formatter: ({ row }) => {
                if (!this.diskInfos.sysDisk) return '-'
                return <a onClick={ () => this.$emit('tab-change', 'disk-list-for-vm-instance-sidepage') }>{this.diskInfos.sysDisk}</a>
              },
            },
            {
              field: 'dataDisk',
              title: '数据盘',
              formatter: ({ row }) => {
                if (!this.diskInfos.dataDisk) return '-'
                return <a onClick={ () => this.$emit('tab-change', 'disk-list-for-vm-instance-sidepage') }>{this.diskInfos.dataDisk}</a>
              },
            },
            getCopyWithContentTableColumn({
              field: 'cdrom',
              title: 'ISO',
              hideField: true,
              slotCallback: row => {
                if (!row.cdrom) return '-'
                const idx = row.cdrom.indexOf('(')
                const id = row.cdrom.substring(idx + 1, row.cdrom.indexOf('/'))
                return [
                  <side-page-trigger permission='images_get' name='SystemImageSidePage' id={id} vm={this}>{ row.cdrom.substring(0, idx) || '-' }</side-page-trigger>,
                ]
              },
            }),
            {
              field: 'isolated_devices',
              title: 'GPU',
              formatter: ({ row }) => {
                if (!row.isolated_devices) return '-'
                const gpuArr = row.isolated_devices
                const obj = {}
                const ids = {}
                gpuArr.forEach(val => {
                  if (!obj[val.model]) {
                    obj[val.model] = 1
                  } else {
                    obj[val.model] += 1
                  }
                  ids[val.model] = val.id
                })
                return Object.keys(obj).map(k => {
                  return <side-page-trigger permission='isolated_devices_get' name='GpuSidePage' id={ids[k]} vm={this}>{`${obj[k]}颗 （${k}）`}</side-page-trigger>
                })
              },
            },
            {
              field: 'backup_host_name',
              title: '备份机的宿主机',
              slots: {
                default: ({ row }) => {
                  return [
                    <side-page-trigger permission='hosts_get' name='HostSidePage' id={row.host_id} vm={this}>{row.backup_host_name}</side-page-trigger>,
                  ]
                },
              },
            },
          ],
        },
        {
          title: '其他设置',
          items: [
            getSwitchTableColumn({
              field: 'disable_delete',
              title: '删除保护',
              change: val => {
                this.onManager('update', {
                  id: this.data.id,
                  managerArgs: {
                    data: { disable_delete: val },
                  },
                })
              },
            }),
          ],
        },
      ]
    },
  },
  methods: {
    _diskStringify (diskObj) {
      let str = ''
      const storageArr = Object.values(ALL_STORAGE)
      for (const k in diskObj) {
        const num = diskObj[k]
        const disk = storageArr.find(v => v.value === k)
        if (disk) {
          str += `、${parseInt(num / 1024)}GB（${disk.label}）`
        } else {
          str += `、${parseInt(num / 1024)}GB（${k}）`
        }
      }
      return str.slice(1)
    },
    _dealSize (sameType) {
      const sameType1 = sameType.map(v => {
        const size = +v.size
        return size
      })
      return sameType1.reduce((a, b) => {
        return a + b
      })
    },
  },
}
</script>
