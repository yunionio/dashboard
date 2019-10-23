<template>
  <detail
    :list="list"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
export default {
  name: 'CloudregionDetail',
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
    return {
      baseInfo: [
        {
          field: 'zone_count',
          title: '可用区（数量）',
        },
        {
          field: 'vpc_count',
          title: '专有网络（数量）',
        },
        {
          field: 'network_count',
          title: 'IP子网（数量）',
        },
        {
          field: 'guest_count',
          title: '云服务器（数量）',
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
