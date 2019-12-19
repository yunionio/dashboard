<template>
  <detail
    :list="list"
    :data="data"
    :extra-info="extraInfo" />
</template>

<script>
import * as R from 'ramda'
import { STORAGE_TYPES } from '@/constants/compute'
import { HYPERVISORS_MAP } from '@/constants'
import { sizestrWithUnit } from '@/utils/utils'

export default {
  name: 'ServertemplateDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    list: {
      type: Object,
      required: true,
    },
  },
  data () {
    const getDiskObj = (row, type) => {
      const { disks, hypervisor } = row.config_info
      const diskList = disks.filter(val => val.disk_type === type)
      if (!diskList.length) return ''
      const diskObj = STORAGE_TYPES[hypervisor][diskList[0].backend]
      const diskType = diskObj ? `（${diskObj.label}）` : ''
      const size = diskList.reduce((a, b) => a.size_mb + b.size_mb, { size_mb: 0 })
      return `${sizestrWithUnit(size, 'M', 1024)}${diskType}`
    }
    return {
      extraInfo: [
        {
          title: '其他信息',
          items: [
            {
              field: 'config_info.region',
              title: '区域',
            },
            {
              field: 'config_info.zone',
              title: '可用区',
            },
            {
              field: 'config_info.hypervisor',
              title: '平台',
              formatter: ({ row }) => {
                return HYPERVISORS_MAP[row.config_info.hypervisor].label || row.config_info.hypervisor
              },
            },
            {
              field: 'config_info.isolated_device_config',
              title: 'GPU型号',
              formatter: ({ row }) => {
                const gpu = row.isolated_device_config
                if (R.is(Object, gpu)) {
                  return `${gpu.vendor}/${gpu.model}`
                }
                return '-'
              },
            },
            {
              field: 'config_info.gcounts',
              title: 'GPU数量',
              formatter: ({ row }) => {
                return `${row.config_info.gcounts || 0}块`
              },
            },
            {
              field: 'config_info.os_type',
              title: '操作系统',
            },
            {
              field: 'config_info.image',
              title: '镜像',
            },
            {
              field: 'config_info.spec',
              title: '规格',
              formatter: ({ row }) => {
                const { hypervisor, sku } = row.config_info
                if (R.is(String, sku)) return sku
                const category = this.getI18NValue(`skuCategoryOptions['${hypervisor}']['${sku.instance_type_category}']`, sku.instance_type_category)
                return `${sku.name} (${category} ${sku.cpu_core_count}核 ${sizestrWithUnit(sku.memory_size_mb, 'M', 1024)})`
              },
            },
            {
              field: 'config_info.sys',
              title: '系统盘',
              formatter: ({ row }) => {
                return getDiskObj(row, 'sys')
              },
            },
            {
              field: 'config_info.disk',
              title: '数据盘',
              formatter: ({ row }) => {
                return getDiskObj(row, 'data')
              },
            },
            {
              field: 'content.keypair',
              title: '管理员密码',
            },
            {
              field: 'config_info.network',
              title: '网络',
              slots: {
                default: ({ row }) => {
                  if (row.config_info.nets && row.config_info.nets.length && row.config_info.nets[0].guest_ip_start) {
                    return row.config_info.nets.map(net => (<div><a-tag>{ `${net.name}（${net.guest_ip_start} - ${net.guest_ip_end}, vlan=${net.vlan_id}）` }</a-tag></div>))
                  }
                  return '默认'
                },
              },
            },
            {
              field: 'config_info.secgroup',
              title: '安全组',
            },
          ],
        },
      ],
    }
  },
  methods: {
    getI18NValue (key, originVal) {
      if (this.$t(key)) {
        return this.$t(key)
      }
      return originVal
    },
  },
}
</script>
