<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    :is-edit-name="!data.is_system"
    :is-edit-desc="!data.is_system" />
</template>

<script>
import {
  getEnabledTableColumn,
} from '@/utils/common/tableColumn'
import PolicyViewer from '../components/PolicyViewer'

export default {
  name: 'PolicyDetail',
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
        getEnabledTableColumn(),
        {
          field: 'is_public',
          title: this.$t('system.text_431'),
          formatter: ({ cellValue }) => {
            return cellValue ? this.$t('system.text_432') : this.$t('system.text_433')
          },
        },
      ],
      extraInfo: [
        {
          title: this.$t('dictionary.policy'),
          items: [
            {
              field: 'scope',
              title: this.$t('system.text_437'),
              formatter: ({ row }) => {
                return this.$t(`policyScopeLabel.${row.scope}`)
              },
            },
            {
              field: 'policy.policy',
              title: this.$t('system.text_438'),
              slots: {
                default: ({ row }) => {
                  return <PolicyViewer policy={ row } />
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
