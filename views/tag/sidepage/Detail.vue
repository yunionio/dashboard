<template>
  <detail
    :onManager="onManager"
    :data="data"
    :extra-info="extraInfo"
    :base-info="baseInfo"
    :on-manager="onManager"
    :name-props="{ edit: false }"
    :desc-props="{ edit: false }" />
</template>

<script>
import { getTagColor } from '@/utils/common/tag'

export default {
  name: 'TagDetail',
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
          field: 'count',
          title: '绑定资源数量',
          slots: {
            default: ({ row }) => {
              return row.count > 0 ? [<a onClick={ () => this.$emit('tab-change', 'bind-resource') }>{ `${row.count}` }</a>] : 0
            },
          },
        },
        {
          field: 'color',
          title: '颜色',
          slots: {
            default: ({ row }) => {
              const color = getTagColor(row.key, row.value)
              return [<span style={{ display: 'inline-block', backgroundColor: color, width: '10px', height: '10px' }} />]
            },
          },
        },
      ],
      extraInfo: [],
    }
  },
}
</script>
