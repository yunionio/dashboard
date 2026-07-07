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
import { getAiProviderLinkColumn, getAiModelLinkColumn, getLlmDeploymentLinkColumn } from '@Ai/utils/aiproxyLlmLinkColumns'
import {
  fetchAiProviderMetaMap,
  fetchRoutingModelsForRouting,
  formatProviderKindLabel,
  inferProviderKind,
} from '@Ai/utils/aiProviderKind'
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
          await this.ensureRoutingModelsResponse(response)
          const rows = response?.data?.data
          if (!Array.isArray(rows) || !rows.length) return
          await Promise.all([
            this.enrichRowsWithAiProviderLinks(response),
            this.enrichRowsWithAiModelLinks(response),
            this.enrichRowsWithProviderKind(response),
          ])
          this.markRoutingModelRowsVisible(rows)
        },
      }),
      columns: [
        {
          field: 'provider_kind',
          title: this.$t('aice.aiproxy.provider_kind'),
          width: 130,
          formatter: ({ row }) => formatProviderKindLabel(this, row.provider_kind),
        },
        getAiProviderLinkColumn(this),
        getLlmDeploymentLinkColumn(this),
        getAiModelLinkColumn(this),
        { field: 'priority', title: this.$t('aice.aiproxy.priority'), width: 90 },
        getEnabledTableColumn(),
      ],
      groupActions: [
        {
          label: this.$t('aice.aiproxy.set_models'),
          permission: 'ai_routings_perform_set_models',
          action: () => {
            const routingModels = Object.keys(this.list.data || {})
              .map(key => this.list.data[key]?.data)
              .filter(row => row && row.ai_provider_id)
            this.createDialog('AiRoutingSetModelsDialog', {
              data: [this.data],
              routingModels,
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
  watch: {
    'data.id' (id, prev) {
      if (id && id !== prev) {
        this.list.fetchData()
      }
    },
  },
  created () {
    if (this.data?.id) {
      this.list.fetchData()
    }
  },
  activated () {
    this.syncAiProviderNamesForList()
    this.syncAiModelNamesForList()
    this.syncAiproxyLlmLinkNamesForList({ withDeployment: true })
    this.ensureRoutingModelListRowsVisible()
  },
  methods: {
    markRoutingModelRowsVisible (rows) {
      ;(rows || []).forEach(row => {
        if (row) row.isDataShow = true
      })
    },
    ensureRoutingModelListRowsVisible () {
      Object.keys(this.list?.data || {}).forEach(key => {
        const row = this.list.data[key]?.data
        if (row && !row.isDataShow) {
          this.$set(row, 'isDataShow', true)
        }
      })
    },
    async ensureRoutingModelsResponse (response) {
      if (!response?.data) return
      let rows = response.data.data
      const routingId = this.data?.id
      if (routingId && (!Array.isArray(rows) || !rows.length)) {
        const embedded = Array.isArray(this.data?.routing_models) ? this.data.routing_models : []
        if (embedded.length) {
          rows = embedded
        } else {
          rows = await fetchRoutingModelsForRouting(routingId, this)
        }
        if (rows?.length) {
          response.data.data = rows
          response.data.total = rows.length
        }
      }
    },
    async enrichRowsWithProviderKind (response) {
      const rows = response?.data?.data
      if (!Array.isArray(rows) || !rows.length) return
      const metaMap = await fetchAiProviderMetaMap(
        rows.map(row => row.ai_provider_id),
        { vm: this },
      )
      if (this._isDestroyed) return
      rows.forEach(row => {
        const meta = metaMap[row.ai_provider_id]
        if (!meta) return
        row.provider_kind = inferProviderKind(meta)
        if (meta.name) row.ai_provider_name = meta.name
        if (meta.provider_key) row.ai_provider_key = meta.provider_key
        if (meta.llm_deployment_id) {
          row.llm_deployment_id = meta.llm_deployment_id
        }
      })
      await this.enrichRowsWithAiproxyLlmLinks(response, { withDeployment: true })
    },
  },
}
</script>
