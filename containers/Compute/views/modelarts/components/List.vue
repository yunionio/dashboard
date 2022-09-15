<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter } from '@/utils/common/tableFilter'
import { disableDeleteAction } from '@/utils/common/tableActions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'ModelArtsList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'modelarts_pools',
        getParams: this.getParam,
        filterOptions: {
          name: getNameFilter(),
        },
        hiddenColumns: ['created_at'],
      }),
      groupActions: [
        {
          label: this.$t('common.create'),
          action: () => {
            this.$router.push({
              path: '/modelarts/create',
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
          label: this.$t('compute.text_275'),
          actions: () => {
            return [
              {
                label: this.$t('compute.perform_sync_status'),
                action: () => {
                  this.onManager('batchPerformAction', {
                    steadyStatus: ['running', 'ready'],
                    managerArgs: {
                      action: 'syncstatus',
                    },
                  })
                },
                meta: () => ({
                  validate: this.list.selected.length,
                }),
              },
              {
                label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
                action: () => {
                  this.createDialog('ChangeOwenrDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    name: 'ModelArts',
                    resource: 'modelarts_pools',
                  })
                },
                meta: () => {
                  const ret = {
                    validate: false,
                    tooltip: null,
                  }
                  ret.validate = true
                  return ret
                },
              },
              disableDeleteAction(this, {
                name: 'ModelArts',
                meta: () => {
                  const ret = { validate: true }
                  return ret
                },
              }),
              {
                label: this.$t('table.action.delete'),
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('table.action.delete'),
                    name: 'ModelArts',
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  return {
                    validate: this.list.selectedItems.length > 0,
                  }
                },
              },
            ]
          },
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
      const ret = {
        ...this.getParams,
        details: true,
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'ModelArtsSidePage', {
        id: row.id,
        resource: 'modelarts_pools',
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
