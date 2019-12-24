<template>
  <detail
    :data="data"
    :extra-info="extraInfo"
    :base-info="baseInfo"
    :name-props="{ edit: false }"
    :desc-props="{ edit: false }" />
</template>

<script>
export default {
  name: 'TagDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        {
          field: 'count',
          title: '绑定资源数量',
          slots: {
            default: ({ row }) => {
              return row.count > 0 ? [<a onClick={ () => this.$emit('tab-change', 'bind-resource') }>{ `${row.count}` }</a>] : 0
            },
          },
        },
      ],
      extraInfo: [
        {
          title: '其他信息',
          items: [
            {
              field: 'color',
              title: '颜色',
              slots: {
                default: ({ row }) => {
                  return [<span style={{ display: 'inline-block', backgroundColor: row.color, width: '10px', height: '10px' }} />]
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
