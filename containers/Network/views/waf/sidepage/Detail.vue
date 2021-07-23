<template>
  <detail
    :data="data"
    :onManager="onManager"
    :base-info="baseInfo"
    status-module="waf" />
</template>

<script>
import _ from 'lodash'
import i18n from '@/locales'
import WindowsMixin from '@/mixins/windows'
import {
  getBrandTableColumn,
  getRegionTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'WafInstanceDetail',
  mixins: [WindowsMixin],
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
          title: i18n.t('network.waf.type'),
          field: 'type',
        },
        {
          field: 'action',
          title: i18n.t('network.waf.action_default'),
          formatter: ({ row }) => {
            const action = _.get(row, ['action', 'action']) || _.get(this.data, 'default_action.action')
            if (action) return i18n.t(`network.waf.rule_action_${action}`)
            return '-'
          },
        },
        getBrandTableColumn(),
        getRegionTableColumn(),
        {
          title: i18n.t('network.text_196'),
          field: 'account',
          slots: {
            default: ({ row }) => {
              return <list-body-cell-wrap hide-field copy field={'account'} row={row}>
                <side-page-trigger permission='cloudaccounts_get' name='CloudaccountSidePage' id={row.account_id} vm={this}>{ row.account }</side-page-trigger>
              </list-body-cell-wrap>
            },
          },
        },
        {
          title: i18n.t('network.waf.manager'),
          field: 'manager',
          slots: {
            default: ({ row }) => {
              return <list-body-cell-wrap hide-field copy field={'manager'} row={row}>
                <side-page-trigger permission='cloudproviders_get' name='CloudproviderSidePage' id={row.manager_id} vm={this}>{ row.account }</side-page-trigger>
              </list-body-cell-wrap>
            },
          },
        },
      ],
    }
  },
  computed: {
  },
}
</script>
