<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    :is-edit-name="!data.is_system"
    :is-edit-desc="!data.is_system"
    :nameRules="nameRules" />
</template>

<script>
import {
  getEnabledTableColumn,
  getTagTableColumn,
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
        getTagTableColumn({
          columns: () => this.columns,
          tipName: this.$t('dictionary.schedtag'),
        }),
      ],
      extraInfo: [
        {
          title: this.$t('dictionary.policy'),
          items: [
            {
              field: 'scope',
              title: this.$t('system.text_326', [this.$t('dictionary.policy')]),
              formatter: ({ row }) => {
                return this.$t(`policyScopeLabel.${row.scope}`)
              },
            },
            {
              field: 'policy.policy',
              title: this.$t('system.text_327', [this.$t('dictionary.policy')]),
              slots: {
                default: ({ row }) => {
                  return <PolicyViewer policy={row} />
                },
              },
            },
          ],
        },
      ],
      nameRules: [
        { required: true, message: this.$t('system.text_168') },
      ],
    }
  },
  methods: {
    getTag (tag) {
      const { tags = [] } = tag
      const ret = tags.map(item => {
        const { key, value } = item
        if (value) {
          return `${key.replace('org:', '')}:${value}`
        } else {
          return key.replace('org:', '')
        }
      })
      return ret.join(' - ')
    },
  },
}
</script>
