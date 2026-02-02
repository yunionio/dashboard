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
import { getSetPublicAction, getEnabledSwitchActions } from '@/utils/common/tableActions'
import expectStatus from '@/constants/expectStatus'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import { filterOptions } from '../utils/filters'

export default {
  name: 'PhoneInstantAppList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => { },
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'llm_instant_models',
        getParams: this.getParam,
        filterOptions,
        hiddenColumns: [],
        steadyStatus: {
          status: expectStatus.mcp ? Object.values(expectStatus.image).flat() : [],
        },
      }),
      groupActions: [
        {
          label: this.$t('common.create'),
          action: () => {
            this.createDialog('LlmInstantmodelCreateDialog', {
              onManager: this.onManager,
              refresh: () => this.list.fetchData(),
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: true,
            }
          },
        },
        {
          label: this.$t('aice.llm_image.import_community'),
          action: () => {
            this.$router.push({ name: 'LlmInstantmodelImportCommunity' })
          },
        },
        {
          label: this.$t('common.batchAction'),
          actions: () => {
            return [
              {
                label: this.$t('aice.perform_sync_status'),
                action: () => {
                  const ids = []
                  for (let i = 0; i < this.list.selectedItems.length; i++) {
                    ids.push(this.list.selectedItems[i].id)
                  }
                  this.onManager('batchPerformAction', {
                    steadyStatus: ['active'],
                    id: ids,
                    managerArgs: {
                      action: 'syncstatus',
                    },
                  })
                  this.refresh()
                },
              },
              {
                label: this.$t('aice.mounted_apps.auto_cache.enable'),
                permission: 'llm_instant_models_perform_enable_auto_cache',
                action: () => {
                  this.createDialog('InstantAppAutoCacheDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const ret = { validate: true, tooltip: null }
                  for (let i = 0; i < this.list.selectedItems.length; i++) {
                    if (!this.list.selectedItems[i].enabled) {
                      ret.validate = false
                      return ret
                    }
                  }
                  return ret
                },
              },
              getSetPublicAction(this, {
                name: this.$t('aice.mounted_apps'),
                scope: 'project',
                resource: 'llm_instant_models',
              }, {
                permission: 'llm_instant_models_perform_public,llm_instant_models_perform_private',
              }),
              ...getEnabledSwitchActions(this, undefined, ['llm_instant_models_perform_enable', 'llm_instant_models_perform_disable'], {
                metas: [
                  () => {
                    const isEnable = !!this.list.selectedItems.find(item => item.enabled)
                    return {
                      validate: this.list.selectedItems.length && !isEnable,
                    }
                  },
                  () => {
                    const isDisable = !!this.list.selectedItems.find(item => !item.enabled)
                    return {
                      validate: this.list.selectedItems.length && !isDisable,
                    }
                  },
                ],
                resourceName: this.$t('aice.mounted_apps'),
              }),
              {
                label: this.$t('table.action.delete'),
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('table.action.delete'),
                    name: this.$t('aice.mounted_apps'),
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  const ret = { validate: this.list.selected.length }
                  if (this.list.selectedItems.some(item => !item.can_delete)) {
                    ret.validate = false
                    return ret
                  }
                  return ret
                },
              },
            ]
          },
        },
      ],
    }
  },
  computed: {
    exportDataOptions () {
      return {
        downloadType: 'local',
        title: this.$t('aice.image'),
        items: [
          { label: 'ID', key: 'id' },
          ...this.columns,
        ],
      }
    },
  },
  created () {
    this.initSidePageTab('detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...this.getParams,
        details: true,
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'LlmInstantModelSidePage', {
        id: row.id,
        resource: 'llm_instant_models',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>

<style>
</style>
