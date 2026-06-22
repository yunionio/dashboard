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
import SingleActionsMixin from '../../ai-model/mixins/singleActions'

export default {
  name: 'AiProviderModelsList',
  mixins: [WindowsMixin, ListMixin, SingleActionsMixin],
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
      columns: [
        getNameDescriptionTableColumn({
          onManager: this.onManager,
          hideField: true,
          slotCallback: row => (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
          ),
        }),
        getEnabledTableColumn(),
        { field: 'model_key', title: this.$t('aice.aiproxy.model_key'), minWidth: 140 },
        getTimeTableColumn(),
      ],
      groupActions: [
        {
          label: this.$t('common.create'),
          permission: 'ai_models_create',
          action: () => {
            this.createDialog('AiModelFormDialog', {
              type: 'create',
              ai_provider_id: this.data.id,
              onManager: this.onManager,
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
  created () {
    this.list.fetchData()
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
