<template>
  <page-list :list="list" :columns="columns" :group-actions="groupActions" :single-actions="singleActions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import AiproxyLlmLinkListMixin from '@Ai/mixins/aiproxyLlmLinkListMixin'
import { getAiproxyResourceScope } from '@Ai/constants/aiproxyResources'
import { getAiproxyBatchEnabledActions } from '@Ai/utils/aiproxyEnabledActions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'AiModelList',
  mixins: [WindowsMixin, ListMixin, AiproxyLlmLinkListMixin, ColumnsMixin, SingleActionsMixin],
  props: { id: String, getParams: { type: Object, default: () => ({}) } },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'ai_models',
        getParams: this.getParam,
        filterOptions: {
          name: { label: this.$t('common.name'), filter: true, formatter: val => `name.contains(${val})` },
          model_key: { label: this.$t('aice.aiproxy.model_key'), filter: true, formatter: val => `model_key.contains(${val})` },
          ai_provider_id: { label: this.$t('aice.aiproxy.ai_provider_id'), filter: true, formatter: val => `ai_provider_id.in(${val})` },
        },
      }),
      groupActions: [
        {
          label: this.$t('common.create'),
          permission: 'ai_models_create',
          action: () => this.$router.push({ name: 'AiModelCreate' }),
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
    this.initSidePageTab('detail')
    this.list.fetchData()
  },
  activated () {
    this.syncAiProviderNamesForList()
  },
  methods: {
    getParam () {
      return {
        ...this.getParams,
        details: true,
        scope: getAiproxyResourceScope('ai_models', this),
      }
    },
  },
}
</script>
