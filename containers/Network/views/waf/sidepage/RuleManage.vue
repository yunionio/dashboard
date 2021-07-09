<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions" />
</template>

<script>
import _ from 'lodash'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

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
        key: 'id',
        resource: () => this.fetchData(),
        getParams: {},
        responseData: this.responseData,
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
            const action = _.get(row, ['action', 'action']) || _.get(this.data, 'default_action.action')
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
              resData: this.data,
              columns: this.columns,
              refresh: this.refresh,
              onManager: this.onManager,
              success: (labels) => {
                // this.fetchData(labels)
                // this.list.fetchData()
              },
            })
          },
        },
      ],
      groupActions: [
        {
          label: this.$t('cloudenv.text_454'),
          permission: 'scheduledtasks_perform_set_label',
          action: () => {
            this.createDialog('ScheduledtaskEditDialog', {
              data: [this.data],
              columns: this.columns,
              onManager: this.onManager,
              success: (labels) => {
                this.fetchData(labels)
                this.list.fetchData()
              },
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
    console.log(this.id)
    // this.$bus.$on('RelatedResourceTagListSidePageRefresh', labels => {
    //   this.fetchData(labels)
    //   this.list.fetchData()
    // }, this)
  },
  methods: {
    fetchData (rules) {
      const response = { data: {} }
      const data = (rules || this.data.rules || []).map((k) => {
        return k
      })
      response.data.data = data
      this.list.responseData = { data }
      return response
    },
  },
}
</script>
