<template>
  <detail
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
// import BrandIcon from '@/sections/BrandIcon'

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
            default: (data) => {
              return [
                <status status={ data.status } statusModule='redis' />,
              ]
            },
          },
        },
        {
          field: 'zone',
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
                default: (data) => {
                  return `${data.engine || ''} ${data.engine_version || ''}`
                },
              },
            },
            {
              title: '可维护时间段',
              slots: {
                default: (data) => {
                  return ''
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
              title: 'CPU',
            },
            {
              field: 'arch_type',
              title: '储存架构',
            },
            {
              field: 'capacity_mb',
              title: '内存',
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
                default: (data) => {
                  return `${data['private_private_ip_addrconnect_port']} ${data['private_connect_port']}`
                },
              },
            },
            {
              field: 'public_ip_addr',
              title: '外网地址',
              slots: {
                default: (data) => {
                  return `${data['public_ip_addr' || '']} ${data['public_connect_port']}`
                },
              },
            },
            {
              field: 'vpc',
              title: 'VPC',
            },
            {
              field: 'network',
              title: '子网',
            },
            {
              field: 'auth_mode',
              title: '访问方式',
              slots: {
                default: (data) => {
                  return data['auth_mode'] === 'on' ? '密码访问' : '免密访问'
                },
              },
            },
          ],
        },
        {
          title: '其他信息',
          items: [
            {
              field: 'health_status',
              title: '健康状态',
            },
          ],
        },
      ],
    }
  },
}
</script>
