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
import SingleActionsMixin from '../../ai-key/mixins/singleActions'

export default {
  name: 'AiProviderApiKeysList',
  mixins: [WindowsMixin, ListMixin, SingleActionsMixin],
  props: {
    data: { type: Object, required: true },
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'ai_keys',
        getParams: () => ({
          ai_provider_id: this.data.id,
          scope: getAiproxyResourceScope('ai_keys', this),
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
        { field: 'weight', title: this.$t('aice.aiproxy.weight'), width: 80 },
        {
          field: 'routing',
          title: this.$t('aice.aiproxy.routing_config'),
          minWidth: 160,
          formatter: ({ row }) => {
            const r = row.routing || {}
            const parts = []
            if (r.allowed_model_keys?.length) parts.push(`+${r.allowed_model_keys.length}`)
            if (r.blocked_model_keys?.length) parts.push(`-${r.blocked_model_keys.length}`)
            return parts.length ? parts.join(' ') : '-'
          },
        },
        getTimeTableColumn(),
      ],
      groupActions: [
        {
          label: this.$t('common.create'),
          permission: 'ai_keys_create',
          action: () => {
            this.createDialog('AiKeyFormDialog', {
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
            ...getAiproxyBatchEnabledActions(this, 'ai_keys', this.$t('aice.aiproxy.api_key')),
            {
              label: this.$t('table.action.delete'),
              permission: 'ai_keys_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: this.list.selectedItems,
                  columns: this.columns,
                  title: this.$t('table.action.delete'),
                  name: this.$t('aice.aiproxy.api_key'),
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
      this.sidePageTriggerHandle(this, 'AiKeySidePage', {
        id: row.id,
        resource: 'ai_keys',
        getParams: () => ({
          ai_provider_id: this.data.id,
          scope: getAiproxyResourceScope('ai_keys', this),
          details: true,
        }),
      }, { list: this.list })
    },
  },
}
</script>
