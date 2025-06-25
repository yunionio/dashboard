<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    @refresh="refreshRule" />
</template>

<script>
import _ from 'lodash'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter } from '@/utils/common/tableFilter'
import { getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import { RULE_ACTIONS } from '../constants'

export default {
  name: 'WafRules',
  mixins: [WindowsMixin, ListMixin],
  props: {
    id: String,
    data: {
      type: Object,
    },
  },
  data () {
    const filterActions = this.data.provider === 'Cloudflare' ? RULE_ACTIONS : [
      { label: this.$t('network.waf.rule_action_Allow'), key: 'Allow' },
      { label: this.$t('network.waf.rule_action_Block'), key: 'Block' },
      { label: this.$t('network.waf.rule_action_Log'), key: 'Log' },
      { label: this.$t('network.waf.rule_action_Count'), key: 'Count' },
      { label: this.$t('network.waf.rule_action_Alert'), key: 'Alert' },
      { label: this.$t('network.waf.rule_action_Detection'), key: 'Detection' },
      { label: this.$t('network.waf.rule_action_Prevention'), key: 'Prevention' },
      // { label: this.$t('network.waf.null'), key: '' },
    ]
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
            items: filterActions,
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
      groupActions: [
        {
          label: this.$t('compute.perform_create'),
          action: () => {
            this.createDialog('WafRuleCreateDialog', {
              waf: this.data,
              columns: this.columns,
              success: () => {
                this.list.fetchData()
              },
            })
          },
          meta: () => {
            return {
              validate: this.data.provider === 'Cloudflare',
              tooltip: this.data.provider !== 'Cloudflare' ? this.$t('cloudenv.brand_action_deny') : '',
            }
          },
        },
      ],
      singleActions: [
        {
          label: this.$t('network.waf.rule_view_action'),
          permission: 'scheduledtasks_perform_set_label',
          action: (row) => {
            if (this.data.provider !== 'Cloudflare') {
              this.createDialog('WafRuleInfoDialog', {
                title: this.$t('network.waf.rule_view'),
                data: [row],
                isEdit: false,
                resData: this.data,
                columns: this.columns,
              })
            } else {
              this.createDialog('WafRuleCreateDialog', {
                title: this.$t('network.waf.rule_view'),
                data: [row],
                type: 'info',
                waf: this.data,
              })
            }
          },
        },
        {
          label: this.$t('table.action.delete'),
          permission: 'waf_rules_delete',
          action: obj => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              columns: this.columns,
              title: this.$t('table.action.delete'),
              name: this.$t('network.waf.rule'),
              onManager: this.onManager,
            })
          },
          meta: obj => this.$getDeleteResult(obj),
        },
      ],
    }
  },
  computed: {
    columns () {
      if (this.data.provider === 'Cloudflare') {
        return [
          getNameDescriptionTableColumn({
            onManager: this.onManager,
            hideField: true,
            edit: false,
            showDesc: false,
            slotCallback: row => {
              return (
                <side-page-trigger onTrigger={() => this.handleOpenSidepage(row, '')}>{row.name}</side-page-trigger>
              )
            },
          }),
          {
            field: 'type',
            title: this.$t('network.waf.rule_type'),
            resizable: true,
            formatter: ({ row }) => {
              return row.type ? this.$t(`network.waf.rule_type.${row.type}`) : '-'
            },
          },
          {
            field: 'action',
            title: this.$t('network.waf.action'),
            resizable: true,
            formatter: ({ row }) => {
              const action = _.get(row, ['action', 'action'])
              if (action) return this.$te(`network.waf.rule_action.${action}`) ? this.$t(`network.waf.rule_action.${action}`) : '-'
              return '-'
            },
          },
        ]
      }
      return [
        {
          field: 'name',
          title: this.$t('network.text_21'),
          resizable: true,
        },
        {
          field: 'priority',
          sortable: true,
          title: this.$t('network.text_81'),
          resizable: true,
        },
        {
          field: 'action',
          title: this.$t('network.waf.action'),
          resizable: true,
          formatter: ({ row }) => {
            const action = _.get(row, ['action', 'action'])
            if (action) return this.$t(`network.waf.rule_action_${action}`)
            return '-'
          },
        },
      ]
    },
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'WafRuleSidePage', {
        id: row.id,
        title: row.name,
        resource: 'waf_rules',
        apiVersion: 'v2',
        getParams: this.getParams,
        refresh: this.refresh,
      }, {
        list: this.list,
        tab,
      })
      this.initSidePageTab(tab)
    },
  },
}
</script>
