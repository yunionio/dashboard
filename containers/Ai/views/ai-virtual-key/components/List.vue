<template>
  <page-list :list="list" :columns="columns" :group-actions="groupActions" :single-actions="singleActions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getAiproxyBatchEnabledActions } from '@Ai/utils/aiproxyEnabledActions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'AiVirtualKeyList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: { id: String, getParams: { type: Object, default: () => ({}) } },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'ai_virtual_keys',
        getParams: this.getParam,
        filterOptions: {
          name: { label: this.$t('common.name'), filter: true, formatter: val => `name.contains(${val})` },
          virtual_key: { label: this.$t('aice.aiproxy.virtual_key_field'), filter: true, formatter: val => `virtual_key.contains(${val})` },
        },
      }),
      groupActions: [
        {
          label: this.$t('common.create'),
          permission: 'ai_virtual_keys_create',
          action: () => this.$router.push({ name: 'AiVirtualKeyCreate' }),
          meta: () => ({ buttonType: 'primary', validate: true }),
        },
        {
          label: this.$t('common.batchAction'),
          actions: () => [
            ...getAiproxyBatchEnabledActions(this, 'ai_virtual_keys', this.$t('aice.aiproxy.virtual_key')),
            {
              label: this.$t('table.action.delete'),
              permission: 'ai_virtual_keys_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: this.list.selectedItems,
                  columns: this.columns,
                  title: this.$t('table.action.delete'),
                  name: this.$t('aice.aiproxy.virtual_key'),
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
