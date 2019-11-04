<template>
  <detail
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
// import BrandIcon from '@/sections/BrandIcon'
import { sizestr } from '@/utils/utils'

export default {
  name: 'redisDetail',
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
      baseInfo: [
        {
          field: 'name',
          title: '名称',
        },
        {
          field: 'status',
          title: '状态',
          slots: {
            default: ({ row }) => {
              return <status status={ row.status } statusModule='redis' />
            },
          },
        },
        {
          field: 'project_domain',
          title: '部门（域）',
        },
        {
          field: 'tenant',
          title: '所属项目',
        },
        {
          field: 'manager',
          title: '云账号',
        },
      ],
      extraInfo: [
        {
          title: '数据库信息',
          items: [
            {
              title: '类型版本',
              slots: {
                default: ({ row }) => {
                  return `${row.engine || ''} ${row.engine_version || ''}`
                },
              },
            },
            {
              title: '可维护时间段',
              slots: {
                default: ({ row }) => {
                  if (row.maintain_start_time && row.maintain_end_time) {
                    return `${row.maintain_start_time}${row.maintain_end_time ? ' ~ ' + row.maintain_end_time : ''}`
                  }
                  return '-'
                },
              },
            },
            {
              field: 'instance_type',
              title: '实例规格',
            },
            {
              field: 'instance_type',
              title: '实例类型',
            },
            {
              field: 'cpu_arch',
              title: 'CPU',
              slots: {
                default: ({ row }) => {
                  return row.cpu_arch || '-'
                },
              },
            },
            {
              field: 'arch_type',
              title: '储存架构',
            },
            {
              field: 'capacity_mb',
              title: '内存',
              slots: {
                default: ({ row }) => {
                  return sizestr(row.capacity_mb, 'M', 1024)
                },
              },
            },
          ],
        },
        {
          title: '链接信息',
          items: [
            {
              field: 'private_ip_addr',
              title: '内网地址',
              slots: {
                default: ({ row }) => {
                  if (row.private_ip_addr) {
                    return `${row['private_ip_addr']}:${row['private_connect_port']}`
                  }
                  return '-'
                },
              },
            },
            {
              field: 'public_ip_addr',
              title: '外网地址',
              slots: {
                default: ({ row }) => {
                  if (row.public_ip_addr) {
                    return `${row['public_ip_addr']}:${row['public_connect_port']}`
                  }
                  return '-'
                },
              },
            },
            {
              field: 'vpc',
              title: 'VPC',
              slots: {
                default: ({ row }) => {
                  return row.vpc || '-'
                },
              },
            },
            {
              field: 'network',
              title: '子网',
              slots: {
                default: ({ row }) => {
                  return row.network || '-'
                },
              },
            },
            {
              field: 'auth_mode',
              title: '访问方式',
              slots: {
                default: ({ row }) => {
                  return row['auth_mode'] === 'on' ? '密码访问' : '免密访问'
                },
              },
            },
          ],
        },
        {
          title: '其他信息',
          items: [
            {
              field: 'created_at',
              title: '创建时间',
              slots: {
                default: ({ row }) => {
                  return this.$moment(row.created_at).format()
                },
              },
            },
            {
              field: 'updated_at',
              title: '更新时间',
              slots: {
                default: ({ row }) => {
                  return this.$moment(row.updated_at).format()
                },
              },
            },
            // {
            //   title: '删除保护',
            //   slots: {
            //     default: (row, h) => {
            //       const handleChange = ({ target }) => {
            //         console.log(target.value)
            //       }
            //       return (
            //         <a-radio-group onChange={handleChange}>
            //           <a-radio-button value={true}>开启</a-radio-button>
            //           <a-radio-button value={false}>关闭</a-radio-button>
            //         </a-radio-group>
            //       )
            //     },
            //   },
            // },
          ],
        },
      ],
    }
  },
}
</script>
