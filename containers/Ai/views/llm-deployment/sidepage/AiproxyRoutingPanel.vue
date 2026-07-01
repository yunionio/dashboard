<template>
  <div :class="embedded ? 'aiproxy-routing-section mt-4' : 'p-3'">
    <a-divider v-if="embedded" orientation="left">{{ $t('aice.llm_deployment.aiproxy_routing') }}</a-divider>
    <template v-if="!routingId">
      <a-empty :description="emptyDescription" />
    </template>
    <template v-else>
      <a-spin :spinning="loading">
        <a-divider v-if="!embedded" orientation="left">{{ $t('aice.llm_deployment.aiproxy_routing') }}</a-divider>
        <a-table
          v-if="routingTableData.length"
          size="small"
          row-key="id"
          :columns="routingColumns"
          :data-source="routingTableData"
          :pagination="false"
          class="mb-4">
          <template v-slot:name="text, row">
            <a @click="handleOpenAiRoutingSidepage(row.id)">{{ text || row.id }}</a>
          </template>
          <template v-slot:model_key="text">
            <span>{{ text || '-' }}</span>
          </template>
          <template v-slot:priority="text">
            <span>{{ formatRoutingPriority(text) }}</span>
          </template>
        </a-table>
        <a-empty
          v-else-if="!loading"
          :description="$t('aice.llm_deployment.aiproxy_routing_empty')" />

        <template v-if="!embedded">
          <a-divider orientation="left">{{ $t('aice.aiproxy.routing_models') }}</a-divider>
          <a-table
            v-if="routingModelsList.length"
            size="small"
            :row-key="routingModelRowKey"
            :columns="bindingColumns"
            :data-source="routingModelsList"
            :pagination="false"
            class="mb-4">
            <template v-slot:provider="text, row">
              <a v-if="text" @click="handleOpenAiProviderSidepage(text)">{{ providerName(row) }}</a>
              <span v-else>-</span>
            </template>
            <template v-slot:model="text, row">
              <a v-if="text" @click="handleOpenAiModelSidepage(text, row.ai_provider_id)">{{ modelName(row) }}</a>
              <span v-else>-</span>
            </template>
          </a-table>
          <a-empty
            v-else-if="!loading"
            :description="$t('aice.llm_deployment.aiproxy_routing_models_empty')" />
        </template>
      </a-spin>
    </template>
  </div>
</template>

<script>
import { Manager } from '@/utils/manager'
import WindowsMixin from '@/mixins/windows'
import AiproxyLlmLinkListMixin from '@Ai/mixins/aiproxyLlmLinkListMixin'
import AiproxyRoutingLinkDetailMixin from '@Ai/mixins/aiproxyRoutingLinkDetailMixin'
import { getAiproxyResourceScope } from '@Ai/constants/aiproxyResources'
import { getAiProviderDisplayName } from '@Ai/utils/aiProviderNames'
import { getAiModelDisplayName } from '@Ai/utils/aiModelNames'
import { formatDeploymentStatus as formatDeploymentStatusLabel } from '@Ai/utils/aiproxyDeploymentActions'

export default {
  name: 'LlmDeploymentAiproxyRoutingPanel',
  mixins: [WindowsMixin, AiproxyLlmLinkListMixin, AiproxyRoutingLinkDetailMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    embedded: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      loading: false,
      routing: null,
      routingModelsList: [],
    }
  },
  computed: {
    routingId () {
      return (this.data?.aiproxy_routing_id || '').trim()
    },
    routingTableData () {
      if (!this.routing) return []
      return [this.routing]
    },
    emptyDescription () {
      if (this.data?.auto_register_aiproxy === false) {
        return this.$t('aice.llm_deployment.aiproxy_routing_disabled')
      }
      const status = this.data?.status
      if (status) {
        return `${this.$t('aice.llm_deployment.aiproxy_routing_empty')} (${this.formatDeploymentStatus(status)})`
      }
      return this.$t('aice.llm_deployment.aiproxy_routing_empty')
    },
    routingColumns () {
      return [
        {
          title: this.$t('common.name'),
          dataIndex: 'name',
          scopedSlots: { customRender: 'name' },
        },
        {
          title: this.$t('aice.aiproxy.model_key'),
          dataIndex: 'model_key',
          scopedSlots: { customRender: 'model_key' },
        },
        {
          title: this.$t('aice.aiproxy.priority'),
          dataIndex: 'priority',
          scopedSlots: { customRender: 'priority' },
          width: 100,
        },
      ]
    },
    bindingColumns () {
      return [
        {
          title: this.$t('aice.aiproxy.provider'),
          dataIndex: 'ai_provider_id',
          scopedSlots: { customRender: 'provider' },
        },
        {
          title: this.$t('aice.aiproxy.model'),
          dataIndex: 'ai_model_id',
          scopedSlots: { customRender: 'model' },
        },
        {
          title: this.$t('aice.aiproxy.priority'),
          dataIndex: 'priority',
          width: 100,
        },
      ]
    },
  },
  watch: {
    routingId: {
      immediate: true,
      handler () {
        this.loadRouting()
      },
    },
  },
  methods: {
    routingModelRowKey (row, index) {
      return row?.id || `${row?.ai_provider_id || ''}-${row?.ai_model_id || ''}-${index}`
    },
    providerName (row) {
      return getAiProviderDisplayName(row, this.aiProviderNameMap)
    },
    modelName (row) {
      return getAiModelDisplayName(row, this.aiModelNameMap)
    },
    formatRoutingPriority (value) {
      return (value === null || value === undefined || value === '') ? '-' : value
    },
    formatDeploymentStatus (status) {
      return formatDeploymentStatusLabel(status, this)
    },
    async fetchRoutingDetail (routingId, scope) {
      const routingMgr = new Manager('ai_routings')
      try {
        const res = await routingMgr.get({
          id: routingId,
          params: { scope, details: true },
        })
        const row = res?.data?.data || res?.data
        if (row?.id) return row
      } catch (e) {
        // fall through to list lookup
      }
      try {
        const { data: { data = [] } } = await routingMgr.list({
          params: {
            scope,
            filter: `id.equals('${routingId}')`,
            limit: 1,
            details: true,
          },
        })
        return data[0] || null
      } catch (e) {
        return null
      }
    },
    async loadRouting () {
      if (!this.routingId) {
        this.routing = null
        this.routingModelsList = []
        return
      }
      this.loading = true
      try {
        const routingScope = getAiproxyResourceScope('ai_routings', this)
        this.routing = await this.fetchRoutingDetail(this.routingId, routingScope)

        if (this.embedded) {
          this.routingModelsList = []
          return
        }

        const modelsMgr = new Manager('ai_routing_models')
        const modelScope = getAiproxyResourceScope('ai_routing_models', this)
        const modelsRes = await modelsMgr.list({
          params: {
            ai_routing_id: this.routingId,
            scope: modelScope,
            details: true,
            limit: 100,
          },
        }).catch(() => ({ data: { data: [] } }))

        this.routingModelsList = Array.isArray(modelsRes.data?.data) ? modelsRes.data.data : []

        if (this.routingModelsList.length) {
          await Promise.all([
            this.enrichRowsWithAiProviderLinks({ data: { data: this.routingModelsList } }),
            this.enrichRowsWithAiModelLinks({ data: { data: this.routingModelsList } }),
          ])
        }
      } catch (e) {
        this.routing = null
        this.routingModelsList = []
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
