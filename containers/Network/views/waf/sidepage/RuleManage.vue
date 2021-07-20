<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    @refresh="refreshRule" />
</template>

<script>
import _ from 'lodash'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter } from '@/utils/common/tableFilter'

export default {
  name: 'WafRulesForWafInstancesSidePage',
  mixins: [WindowsMixin, ListMixin],
  props: {
    id: String,
    data: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        apiVersion: 'v2',
        resource: 'waf_rules',
        getParams: { details: true, waf_instance_id: this.data.id },
        filterOptions: {
          name: getNameFilter(),
          action: {
            label: this.$t('network.waf.action'),
            dropdown: true,
            multiple: true,
            items: [
              { label: this.$t('network.waf.rule_action_Allow'), key: 'Allow' },
              { label: this.$t('network.waf.rule_action_Block'), key: 'Block' },
              { label: this.$t('network.waf.rule_action_Log'), key: 'Log' },
              { label: this.$t('network.waf.rule_action_Count'), key: 'Count' },
              { label: this.$t('network.waf.rule_action_Alert'), key: 'Alert' },
              { label: this.$t('network.waf.rule_action_Detection'), key: 'Detection' },
              { label: this.$t('network.waf.rule_action_Prevention'), key: 'Prevention' },
              // { label: this.$t('network.waf.null'), key: '' },
            ],
            filter: true,
            mapper: (data) => {
              return data.map(item => {
                return {
                  key: item.key,
                  label: item.key,
                }
              })
            },
            formatter: val => {
              return `action.contains(${val})`
            },
          },
        },
      }),
      columns: [
        {
          field: 'name',
          title: this.$t('network.text_21'),
        },
        {
          field: 'priority',
          title: this.$t('network.text_81'),
        },
        {
          field: 'action',
          title: this.$t('network.waf.action'),
          formatter: ({ row }) => {
            const action = _.get(row, ['action', 'action'])
            if (action) return this.$t(`network.waf.rule_action_${action}`)
            return '-'
          },
        },
      ],
      singleActions: [
        {
          label: this.$t('network.waf.rule_view_action'),
          permission: 'scheduledtasks_perform_set_label',
          action: (row) => {
            this.createDialog('WafRuleInfoDialog', {
              title: this.$t('network.waf.rule_view'),
              data: [row],
              isEdit: false,
              resData: this.data,
              columns: this.columns,
            })
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
