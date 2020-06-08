<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import WindowsMixin from '@/mixins/windows'
import { ENABLED_OPTS } from '@/constants'
import ListMixin from '@/mixins/list'

export default {
  name: 'AnsibleTemplateList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'devtool_templates',
        getParams: this.getParams,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          enabled: {
            label: '启用状态',
            dropdown: true,
            multiple: true,
            items: ENABLED_OPTS,
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '启用状态', key: 'enabled' },
          { label: '时间间隔', key: 'interval' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: '创建时间', key: 'create_at' },
        ],
      },
      groupActions: [
        // {
        //   label: '新建',
        //   action: () => {
        //     this.$router.push('/ansibletemplate/create')
        //   },
        //   meta: (obj) => {
        //     return {
        //       buttonType: 'primary',
        //     }
        //   },
        // },
        // {
        //   label: '删除',
        //   permission: 'disks_delete',
        //   action: () => {
        //     this.createDialog('DeleteResDialog', {
        //       vm: this,
        //       data: this.list.selectedItems,
        //       columns: this.columns,
        //       title: '删除',
        //       onManager: this.onManager,
        //     })
        //   },
        //   meta: () => this.$getDeleteResult(this.list.selectedItems),
        // },
      ],
    }
  },
  created () {
    this.initSidePageTab('detail')
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'AnsibleTemplateSidepage', {
        id: row.id,
        resource: 'devtool_templates',
        getParams: this.getParams,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
