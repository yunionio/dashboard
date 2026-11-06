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
import { getAiproxyResourceScope } from '@Ai/constants/aiproxyResources'
import { getAiproxyBatchEnabledActions } from '@Ai/utils/aiproxyEnabledActions'
import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import {
  getAiModelVisualProviderLinkColumn,
  getAiModelVisualTableColumn,
  shouldShowAiModelVisualColumn,
} from '@Ai/utils/aiModelVisual'
import AiproxyLlmLinkListMixin from '@Ai/mixins/aiproxyLlmLinkListMixin'
import SingleActionsMixin from '../../ai-model/mixins/singleActions'

export default {
  name: 'AiProviderModelsList',
  mixins: [WindowsMixin, ListMixin, AiproxyLlmLinkListMixin, SingleActionsMixin],
  props: {
    data: { type: Object, required: true },
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'ai_models',
        getParams: () => ({
          ai_provider_id: this.data.id,
          scope: getAiproxyResourceScope('ai_models', this),
          details: true,
        }),
      }),
      groupActions: [
        {
          label: this.$t('aice.aiproxy.set_models'),
          permission: 'ai_providers_perform_set_models',
          action: () => {
            this.createDialog('AiProviderSetModelsDialog', {
              data: [this.data],
              refresh: () => this.list.fetchData(),
            })
          },
          meta: () => ({ buttonType: 'primary', validate: true }),
        },
        {
          label: this.$t('common.batchAction'),
          actions: () => [
            ...getAiproxyBatchEnabledActions(this, 'ai_models', this.$t('aice.aiproxy.model')),
            {
              label: this.$t('table.action.delete'),
              permission: 'ai_models_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: this.list.selectedItems,
                  columns: this.columns,
                  title: this.$t('table.action.delete'),
                  name: this.$t('aice.aiproxy.model'),
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
  computed: {
    columns () {
      const cols = [
        getNameDescriptionTableColumn({
          onManager: this.onManager,
          hideField: true,
          slotCallback: row => (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
          ),
        }),
        getEnabledTableColumn(),
        { field: 'model_key', title: this.$t('aice.aiproxy.model_key'), minWidth: 140 },
        {
          field: 'context_window',
          title: this.$t('aice.aiproxy.context_window'),
          minWidth: 120,
          formatter: ({ row }) => row.context_window || '-',
        },
        {
          field: 'input_modalities',
          title: this.$t('aice.aiproxy.capability_vision'),
          minWidth: 100,
          formatter: ({ row }) => (Array.isArray(row.input_modalities) && row.input_modalities.includes('image')
            ? this.$t('status.enabled.true')
            : this.$t('status.enabled.false')),
        },
      ]
      if (shouldShowAiModelVisualColumn(this.data)) {
        cols.push(getAiModelVisualTableColumn(this))
        cols.push(getAiModelVisualProviderLinkColumn(this))
      }
      cols.push(getTimeTableColumn())
      return cols
    },
  },
  created () {
    this.list.fetchData()
    this.list.$watch('data', () => this.syncAiProviderNamesForList(), { deep: true })
  },
  activated () {
    this.syncAiProviderNamesForList()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'AiModelSidePage', {
        id: row.id,
        resource: 'ai_models',
        getParams: () => ({
          ai_provider_id: this.data.id,
          scope: getAiproxyResourceScope('ai_models', this),
          details: true,
        }),
      }, { list: this.list })
    },
  },
}
</script>
