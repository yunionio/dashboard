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
import {
  getNameFilter,
  getCreatedAtFilter,
} from '@/utils/common/tableFilter'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'K8sReposList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data  () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'container_registries',
        apiVersion: 'v1',
        getParams: this.getParams,
        filterOptions: {
          name: getNameFilter(),
          url: {
            label: this.$t('k8s.repo.url'),
          },
          created_at: getCreatedAtFilter(),
        },
      }),
      groupActions: [
        {
          label: this.$t('common.create'),
          permission: 'k8s_container_registries_create',
          action: () => {
            this.createDialog('ReposCreateDialog', {
              refresh: this.refresh,
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
          label: this.$t('table.action.delete'),
          permission: 'k8s_container_registries_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('table.action.delete'),
              name: this.$t('k8s.text_158'),
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
      this.sidePageTriggerHandle(this, 'K8sReposSidePage', {
        id: row.id,
        resource: 'container_registries',
        apiVersion: 'v1',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
