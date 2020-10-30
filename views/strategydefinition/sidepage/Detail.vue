<template>
  <detail
    :showDesc="false"
    :isEditDesc="false"
    :isEditName="false"
    :data="data"
    :onManager="onManager"
    :base-info="baseInfo" />
</template>

<script>
import * as R from 'ramda'
import { CATEGORY_LABEL_MAP, POLICIES_VALUE_MAP } from '../config'

export default {
  name: 'StrategyDefinitionDetail',
  props: {
    onManager: {
      type: Function,
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
          field: 'category',
          title: this.$t('cloudenv.text_502'),
          formatter: ({ row, cellValue }) => {
            return CATEGORY_LABEL_MAP[cellValue]
          },
        },
        {
          field: 'policies',
          title: this.$t('cloudenv.text_501'),
          width: 220,
          type: 'expand',
          slots: {
            default: ({ row }) => {
              const ret = []
              R.forEachObjIndexed((value, key) => {
                ret.push(<a-tag class='mb-2'>{ POLICIES_VALUE_MAP[row.category][key] }{ value === true ? '' : '：' + value }</a-tag>)
              }, row.policies)
              return ret
            },
          },
        },
      ],
    }
  },
}
</script>
