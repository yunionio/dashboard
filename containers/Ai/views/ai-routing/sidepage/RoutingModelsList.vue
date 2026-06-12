<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :show-searchbox="false" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import AiproxyLlmLinkListMixin from '@Ai/mixins/aiproxyLlmLinkListMixin'
import { getAiproxyResourceScope } from '@Ai/constants/aiproxyResources'
import { getAiProviderLinkColumn, getLlmInstanceLinkColumn } from '@Ai/utils/aiproxyLlmLinkColumns'
import { getEnabledTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'AiRoutingModelsList',
  mixins: [WindowsMixin, ListMixin, AiproxyLlmLinkListMixin],
  props: {
    data: { type: Object, required: true },
    id: String,
    onManager: { type: Function, required: true },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'ai_routing_models',
        getParams: () => ({
          ai_routing_id: this.data.id,
          scope: getAiproxyResourceScope('ai_routing_models', this),
          details: true,
        }),
        fetchDataCb: async response => {
          await Promise.all([
            this.enrichRowsWithAiProviderLinks(response),
            this.enrichRowsWithAiproxyLlmLinks(response, { withInstance: true }),
          ])
        },
      }),
      columns: [
        getAiProviderLinkColumn(this),
        { field: 'ai_model_id', title: this.$t('aice.aiproxy.ai_model_id'), minWidth: 120 },
        { field: 'model_pattern', title: this.$t('aice.aiproxy.model_pattern'), minWidth: 120 },
        { field: 'priority', title: this.$t('aice.aiproxy.priority'), width: 90 },
        getLlmInstanceLinkColumn(this),
        getEnabledTableColumn(),
      ],
      groupActions: [
        {
          label: this.$t('aice.aiproxy.set_models'),
          permission: 'ai_routings_perform_set_models',
          action: () => {
            this.createDialog('AiRoutingSetModelsDialog', {
              data: [this.data],
              onManager: this.onManager,
              refresh: () => this.list.fetchData(),
            })
          },
          meta: () => ({ buttonType: 'primary', validate: true }),
        },
        {
          label: this.$t('table.action.delete'),
          permission: 'ai_routing_models_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('table.action.delete'),
              name: this.$t('aice.aiproxy.routing_models'),
              onManager: this.onManager,
            })
          },
          meta: () => ({ validate: this.list.allowDelete() }),
        },
      ],
      singleActions: [
        {
          label: this.$t('table.action.delete'),
          permission: 'ai_routing_models_delete',
          action: obj => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              columns: this.columns,
              title: this.$t('table.action.delete'),
              name: this.$t('aice.aiproxy.routing_models'),
              onManager: this.onManager,
            })
          },
          meta: obj => this.$getDeleteResult(obj),
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  activated () {
    this.syncAiProviderNamesForList()
    this.syncAiproxyLlmLinkNamesForList({ withInstance: true })
  },
}
</script>
