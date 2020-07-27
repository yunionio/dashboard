<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>

export default {
  name: 'LbaclDetail',
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
          field: 'acl_entries',
          title: this.$t('network.text_312'),
          formatter: ({ cellValue }) => {
            return cellValue ? cellValue.map(item => <div>{item.cidr}</div>) : '-'
          },
        },
      ],
      extraInfo: [],
    }
  },
}
</script>
