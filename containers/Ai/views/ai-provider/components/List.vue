<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getAiproxyResourceScope } from '@Ai/constants/aiproxyResources'
import { getAiproxyBatchEnabledActions } from '@Ai/utils/aiproxyEnabledActions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'AiProviderList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: { type: Object, default: () => ({}) },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'ai_providers',
        getParams: this.getParam,
        filterOptions: {
          name: { label: this.$t('common.name'), filter: true, formatter: val => `name.contains(${val})` },
          provider_key: { label: this.$t('aice.aiproxy.provider_key'), filter: true, formatter: val => `provider_key.contains(${val})` },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('common.name'), key: 'name' },
          { label: this.$t('aice.aiproxy.provider_key'), key: 'provider_key' },
        ],
      },
      groupActions: [
        {
          label: this.$t('common.create'),
          permission: 'ai_providers_create',
          action: () => this.$router.push({ name: 'AiProviderCreate' }),
          meta: () => ({ buttonType: 'primary', validate: true }),
        },
        {
          label: this.$t('common.batchAction'),
          actions: () => [
            ...getAiproxyBatchEnabledActions(this, 'ai_providers', this.$t('aice.aiproxy.provider')),
            {
              label: this.$t('table.action.delete'),
              permission: 'ai_providers_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: this.list.selectedItems,
                  columns: this.columns,
                  title: this.$t('table.action.delete'),
                  name: this.$t('aice.aiproxy.provider'),
                  onManager: this.onManager,
                })
              },
              meta: () => this.$getDeleteResult(this.list.selectedItems),
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
  methods: {
    getParam () {
      return {
        ...this.getParams,
        details: true,
        scope: getAiproxyResourceScope('ai_providers', this),
        filter: ['llm_deployment_id.isnullorempty()'],
      }
    },
  },
}
</script>
