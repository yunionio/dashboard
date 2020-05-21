<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>

export default {
  name: 'LbcertDetail',
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
          field: 'fingerprint',
          title: '指纹（可不加）',
          showOverflow: 'ellipsis',
          width: '120px',
          slots: {
            default: ({ row, cellValue }, h) => {
              let ret = [<list-body-cell-wrap row={ row } field="fingerprint" />]
              return ret
            },
          },
        },
        {
          field: 'common_name',
          title: '证书域名',
        },
        {
          field: 'not_after',
          title: '过期时间',
        },
      ],
      extraInfo: [],
    }
  },
}
</script>
