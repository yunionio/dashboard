
<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter } from '@/utils/common/tableFilter'

export default {
  name: 'K8SRepoList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'repos',
        apiVersion: 'v1',
        getParams: this.getParams,
        filterOptions: {
          name: getNameFilter(),
        },
      }),
      groupActions: [
        {
          label: this.$t('helm.text_68'),
          permission: 'k8s_repos_create',
          action: () => {
            this.createDialog('ChartCreateDialog', {
              onManager: this.onManager,
              formType: 'create',
              refresh: this.refresh,
            })
          },
          meta: () => ({
            buttonType: 'primary',
            validate: this.$store.getters.isAmdinMode,
          }),
        },
        {
          label: this.$t('helm.text_69'),
          permission: 'k8s_repos_delete',
          action: () => {
            const data = this.list.selectedItems
            this.createDialog('DeleteResDialog', {
              vm: this,
              data,
              columns: this.columns,
              title: this.$t('helm.text_69'),
              name: this.$t('helm.text_6'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            const isAdmin = this.$store.getters.isAdminMode
            const validate = this.list.selectedItems.length > 0 && isAdmin && this.list.selectedItems.every(val => val.can_delete)
            let tooltip = ''
            if (!isAdmin) {
              tooltip = this.$t('helm.text_89')
            }
            return {
              validate,
              tooltip,
            }
          },
        },
      ],
    }
  },
  created () {
    this.fetchData()
  },
  methods: {
    fetchData () {
      this.list.fetchData()
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'K8SRepoSidePage', {
        id: row.name,
        resource: 'repos',
        getParams: this.getParams,
        idKey: 'name',
        apiVersion: 'v1',
      }, {
        list: this.list,
      })
    },
  },
}
</script>
