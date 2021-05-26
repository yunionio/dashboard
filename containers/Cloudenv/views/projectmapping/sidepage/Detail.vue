<template>
  <detail
    :data="data"
    :onManager="onManager"
    :base-info="baseInfo" />
</template>

<script>
import i18n from '@/locales'
import {
// getCopyWithContentTableColumn,
// getPublicScopeTableColumn,
  getEnabledTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'ProjectMappingDetail',
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
          title: i18n.t('cloudenv.text_582'),
          filed: 'rules',
          slots: {
            default: ({ row }) => {
              if (!row.rules) return '-'
              return <a onClick={ () => this.$emit('tab-change', 'rule-list') }>{row.rules.length}</a>
            },
          },
        },
        // getPublicScopeTableColumn({ vm: this, resource: 'proxysettings' }),
        // getCopyWithContentTableColumn({
        //   field: 'https_proxy',
        //   title: this.$t('cloudenv.text_395'),
        // }),
        // getCopyWithContentTableColumn({
        //   field: 'http_proxy',
        //   title: this.$t('cloudenv.text_398'),
        // }),
        // getCopyWithContentTableColumn({
        //   field: 'no_proxy',
        //   title: this.$t('cloudenv.text_401'),
        // }),
      ],
    }
  },
  computed: {
  },
}
</script>
