<template>
  <detail
    :data="data"
    :onManager="onManager"
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
    onManager: {
      type: Function,
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
          title: 'VPC（数量）',
        },
        {
          field: 'network_count',
          title: 'IP子网（数量）',
        },
        {
          field: 'guest_count',
          title: `${this.$t('dictionary.server')}(数量)`,
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
