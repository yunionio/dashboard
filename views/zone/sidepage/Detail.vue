<template>
  <detail
    :list="list"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
export default {
  name: 'ZoneDetail',
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
          field: 'cloudregion',
          title: '区域',
        },
        {
          field: 'baremetals',
          title: '物理机(数量)',
        },
        {
          field: 'baremetals_enabled',
          title: '可用物理机',
        },
        {
          field: 'hosts',
          title: '宿主机(数量)',
        },
        {
          field: 'hosts_enabled',
          title: '可用宿主机',
        },
        {
          field: 'storages',
          title: '存储(数量)',
        },
        {
          field: 'wires',
          title: '二层网络(数量)',
        },
        {
          field: 'networks',
          title: 'IP子网(数量)',
        },
      ],
      extraInfo: [
        {
          title: '其他信息',
          items: [
            {
              field: 'location',
              title: '位置',
            },
          ],
        },
      ],
    }
  },
}
</script>
