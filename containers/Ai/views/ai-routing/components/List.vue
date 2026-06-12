<template>
  <page-list :list="list" :columns="columns" :group-actions="groupActions" :single-actions="singleActions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import AiproxyLlmLinkListMixin from '@Ai/mixins/aiproxyLlmLinkListMixin'
import { getAiproxyBatchEnabledActions } from '@Ai/utils/aiproxyEnabledActions'
import { getSetPublicAction } from '@/utils/common/tableActions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'AiRoutingList',
  mixins: [WindowsMixin, ListMixin, AiproxyLlmLinkListMixin, ColumnsMixin, SingleActionsMixin],
  props: { id: String, getParams: { type: Object, default: () => ({}) } },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'ai_routings',
        getParams: this.getParam,
        filterOptions: {
          name: { label: this.$t('common.name'), filter: true, formatter: val => `name.contains(${val})` },
          model_pattern: { label: this.$t('aice.aiproxy.model_pattern'), filter: true, formatter: val => `model_pattern.contains(${val})` },
        },
        fetchDataCb: async response => {
          await this.enrichRowsWithAiproxyLlmLinks(response, { withDeployment: true })
        },
      }),
      groupActions: [
        {
          label: this.$t('common.create'),
          permission: 'ai_routings_create',
          action: () => this.$router.push({ name: 'AiRoutingCreate' }),
          meta: () => ({ buttonType: 'primary', validate: true }),
        },
        {
          label: this.$t('common.batchAction'),
          actions: () => [
            getSetPublicAction(this, {
              name: this.$t('aice.aiproxy.routing'),
              scope: 'project',
              resource: 'ai_routings',
            }, {
              permission: 'ai_routings_perform_public,ai_routings_perform_private',
            }),
            ...getAiproxyBatchEnabledActions(this, 'ai_routings', this.$t('aice.aiproxy.routing')),
            {
              label: this.$t('table.action.delete'),
              permission: 'ai_routings_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: this.list.selectedItems,
                  columns: this.columns,
                  title: this.$t('table.action.delete'),
                  name: this.$t('aice.aiproxy.routing'),
                  onManager: this.onManager,
                })
              },
              meta: () => ({ validate: this.list.allowDelete() }),
            },
          ],
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('detail')
    this.list.fetchData()
  },
  activated () {
    this.syncAiproxyLlmLinkNamesForList({ withDeployment: true })
  },
  methods: {
    getParam () {
      return {
        ...this.getParams,
        details: true,
        scope: this.$store.getters.scope,
      }
    },
  },
}
</script>
