<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import { getStatusFilter, getProjectDomainFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import { getDomainChangeOwnerAction, getSetPublicAction } from '@/utils/common/tableActions'

export default {
  name: 'globalVpcList',
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
        resource: 'globalvpcs',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          status: getStatusFilter('globalVpc'),
          project_domain: getProjectDomainFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '状态', key: 'status' },
          { label: '共享范围', key: 'public_scope' },
          { label: `所属${this.$t('dictionary.domain')}`, key: 'project_domain' },
        ],
      },
      groupActions: [
        // {
        //   label: '新建',
        //   action: () => {
        //     this.createDialog('GlobalVpcCreateDialog', {
        //       title: '新建全局VPC',
        //       onManager: this.onManager,
        //     })
        //   },
        //   meta: () => {
        //     return {
        //       buttonType: 'primary',
        //     }
        //   },
        // },
        {
          label: this.$t('common.batchAction'),
          actions: () => {
            return [
              getDomainChangeOwnerAction(this, {
                name: this.$t('dictionary.globalvpc'),
                resource: 'globalvpcs',
              }),
              getSetPublicAction(this, {
                name: this.$t('dictionary.globalvpc'),
                scope: 'domain',
                resource: 'globalvpcs',
              }),
              {
                label: '删除',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    name: this.$t('dictionary.globalvpc'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: '删除',
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  return {
                    validate: this.list.allowDelete(),
                  }
                },
              },
            ]
          },
          meta: () => {
            return {
              validate: this.list.selectedItems && this.list.selectedItems.length,
            }
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
      this.sidePageTriggerHandle(this, 'globalVpcSidePage', {
        id: row.id,
        resource: 'globalvpcs',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
