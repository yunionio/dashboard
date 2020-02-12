<template>
  <detail
    :list="list"
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
    list: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        {
          field: 'acl_entries',
          title: '源地址 | 备注',
          formatter: ({ cellValue }) => {
            return cellValue ? cellValue.map(item => <div>{item.cidr}</div>) : '-'
          },
        },
      ],
      extraInfo: [
        {
          title: '其他信息',
          items: [
          ],
        },
      ],
    }
  },
}
</script>
