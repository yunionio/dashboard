<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import { getEnabledTableColumn, getNameDescriptionTableColumn, getProjectTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import { ENABLED_OPTS } from '@/constants'

export default {
  name: 'AnsibleTemplateList',
  mixins: [WindowsMixin],
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
              return `name.contains(${val})`
            },
          },
          'enabled': {
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
          { label: '项目', key: 'tenant' },
          { label: '创建时间', key: 'create_at' },
        ],
      },
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={() => this.sidePageTriggerHandle(row.id, 'AnsibleTemplateSidepage')}>{row.name}</side-page-trigger>
            )
          },
        }),
        getEnabledTableColumn(),
        {
          filed: 'interval',
          title: '时间间隔',
          width: 100,
          slots: {
            default: ({ row }) => {
              return row['hour'] + '小时'
            },
          },
        },
        getProjectTableColumn(),
        getTimeTableColumn(),
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.$router.push('/ansibletemplate/create')
          },
          meta: (obj) => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: '删除',
          permission: 'disks_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: '删除',
              list: this.list,
            })
          },
          meta: () => this.$getDeleteResult(this.list.selectedItems),
        },
      ],
      singleActions: [
        {
          label: '修改属性',
          action: (row) => {
            const { id } = row
            this.$router.push(`/ansibletemplate/create?id=${id}`)
          },
        },
        {
          label: '更多',
          actions: (obj) => {
            return [
              {
                label: '启用',
                action: () => {
                  this.list.onManager('update', {
                    id: obj.id,
                    managerArgs: {
                      data: {
                        enabled: true,
                      },
                    },
                  })
                },
                meta: () => ({
                  validate: !obj.enabled,
                  tooltip: obj.enabled ? '请选择已禁用的模版' : '',
                }),
              },
              {
                label: '禁用',
                action: () => {
                  this.list.onManager('update', {
                    id: obj.id,
                    managerArgs: {
                      data: {
                        enabled: false,
                      },
                    },
                  })
                },
                meta: () => ({
                  validate: obj.enabled,
                  tooltip: !obj.enabled ? '请选择已启用的模版' : '',
                }),
              },
              {
                label: '关联主机',
                action: data => {
                  this.createDialog('AnsibleTemplateBindServerDialog', {
                    data: [data],
                    columns: this.columns,
                    title: '关联主机',
                    list: this.list,
                  })
                },
                meta: () => ({
                  validate: obj.enabled,
                  tooltip: !obj.enabled ? '请选择已启用的实例' : '',
                }),
              },
              {
                label: '删除',
                action: data => {
                  this.createDialog('DeleteResDialog', {
                    data: [data],
                    columns: this.columns,
                    title: '关联主机',
                    list: this.list,
                  })
                },
                meta: () => ({
                  validate: obj.can_delete,
                }),
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
}
</script>
