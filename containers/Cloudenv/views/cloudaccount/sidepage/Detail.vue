<template>
  <detail
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
import BrandIcon from '@/sections/BrandIcon'

export default {
  name: 'CloudaccountDetail',
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
          field: 'brand',
          title: '平台',
          slots: {
            default: data => {
              return [
                <BrandIcon tooltip={ data.brand } name={ data.brand } />,
              ]
            },
          },
        },
        {
          field: 'account',
          title: '账号',
        },
        {
          field: 'enabled',
          title: '是否启用',
          slots: {
            default: (data) => {
              return [
                <status status={ data.enabled } statusModule='enabled' />,
              ]
            },
          },
        },
        {
          field: 'status',
          title: '状态',
          slots: {
            default: (data) => {
              return [
                <status status={ data.status } statusModule='cloudaccount' />,
              ]
            },
          },
        },
        {
          field: 'created_at',
          title: '创建时间',
          formatter: data => {
            return this.$moment(data.created_at).format()
          },
        },
        {
          field: 'last_sync',
          title: '同步时间',
          formatter: data => {
            return this.$moment(data.last_sync).format()
          },
        },
      ],
      extraInfo: [
        {
          title: '其他信息',
          items: [
            {
              field: 'health_status',
              title: '健康状态',
              slots: {
                default: data => {
                  return [
                    <status status={ data.health_status } statusModule='cloudaccountHealthStatus' />,
                  ]
                },
              },
            },
          ],
        },
      ],
    }
  },
}
</script>
