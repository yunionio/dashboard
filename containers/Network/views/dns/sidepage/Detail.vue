<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    :nameProps="{edit: false}" />
</template>

<script>
export default {
  name: 'DNSDetail',
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
          field: 'records',
          title: this.$t('network.text_152'),
        },
        {
          field: 'ttl',
          title: 'TTL',
        },
        {
          field: 'enabled',
          title: this.$t('network.text_27'),
          formatter: ({ cellValue }) => {
            return <span style={{ color: cellValue ? '#67C23A' : '#F56C6C' }}>{cellValue ? this.$t('network.text_189') : this.$t('network.text_190') }</span>
          },
        },
      ],
      extraInfo: [],
    }
  },
}
</script>
