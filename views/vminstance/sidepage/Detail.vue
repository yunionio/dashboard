<template>
  <detail
    :list="list"
    :data="data"
    :extra-info="extraInfo"
    status-module="server" />
</template>

<script>
import { getCopyWithContentTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'VmInstanceDetail',
  props: {
    list: {
      type: Object,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      extraInfo: [
        {
          title: '配置信息',
          items: [
            {
              field: 'os_type',
              title: '操作系统',
              formatter: ({ row }) => {
                const distribution = (row.metadata && row.metadata.os_distribution) ? row.metadata.os_distribution : row.os_type
                const { os_version: version = '' } = row.metadata || {}
                return distribution + version
              },
            },
            getCopyWithContentTableColumn({ field: 'ips', title: 'IP' }),
            {
              field: 'isolated_devices',
              title: 'GPU',
              formatter: ({ row }) => {
                if (!row.isolated_devices) return '-'
                let gpuArr = row.isolated_devices.split(/\n/g)
                if (!gpuArr) return '-'
                gpuArr = gpuArr.filter(v => !!v)
                let obj = {}
                gpuArr.forEach(val => {
                  if (!obj[val]) {
                    obj[val] = 1
                  } else {
                    obj[val] += 1
                  }
                })
                let str = ''
                for (const k in obj) {
                  const n = obj[k]
                  str += `、${n}颗（${k}）`
                }
                return str.slice(1)
              },
            },
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
          ],
        },
      ],
    }
  },
}
</script>
