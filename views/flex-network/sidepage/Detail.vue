<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    status-module="network"
    :extra-info="extraInfo" />
</template>

<script>
export default {
  name: 'FlexNetworkDetail',
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
      baseInfo: [
        {
          field: 'mac',
          title: 'MAC地址',
        },
        {
          field: 'associate_type',
          title: '绑定设备类型',
        },
        {
          field: 'associate_id',
          title: '绑定设备',
        },
      ],
      columns: [
        {
          field: 'ip_addr',
          title: 'IP',
        },
        {
          field: 'network',
          title: '子网IP(VPC)',
        },
        {
          field: 'networkinterface_id',
          title: '网卡ID',
        },
        {
          field: 'primary',
          title: '主IP',
          formatter: ({ cellValue }) => {
            return cellValue ? '是' : '否'
          },
        },
      ],
      extraInfo: [
        {
          title: 'IP列表',
          field: 'networks',
          slots: {
            default: ({ row }, h) => {
              return [
                <vxe-grid class="mb-2" data={ row.networks } columns={ this.columns } />,
              ]
            },
          },
        },
      ],
    }
  },
}
</script>
