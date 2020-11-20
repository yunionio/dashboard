<template>
  <detail
    :showDesc="false"
    :isEditDesc="false"
    :isEditName="false"
    :data="data"
    :onManager="onManager"
    :base-info="baseInfo"
    :nameProps="{ field: 'policy_name' }"
    :hiddenKeys="['project_domain', 'tenant', 'status']" />
</template>

<script>
import * as R from 'ramda'
import { CATEGORY_LABEL_MAP, POLICIES_VALUE_MAP } from '@Cloudenv/views/strategydefinition/config'

export default {
  name: 'StrategyAllocationDetail',
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
          field: 'policy',
          title: this.$t('cloudenv.text_501'),
          width: 220,
          type: 'expand',
          slots: {
            default: ({ row }) => {
              const ret = []
              R.forEachObjIndexed((value, key) => {
                ret.push(<a-tag class='mb-2'>{ POLICIES_VALUE_MAP[row.category][key] }{ value === true ? '' : '：' + value }</a-tag>)
              }, row.policy)
              return ret
            },
          },
        },
        {
          field: 'scope',
          title: this.$t('cloudenv.text_503'),
          formatter: ({ row }) => {
            let ret = this.$t('cloudenv.text_504')
            if (row.project_domain) {
              ret = this.$t('cloudenv.text_505', [row.project_domain])
            }
            if (row.project) {
              ret = this.$t('cloudenv.text_506', [row.project])
            }
            return ret
          },
        },
      ],
    }
  },
}
</script>
