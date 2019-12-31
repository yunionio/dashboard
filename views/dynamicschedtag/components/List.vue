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
import { getNameDescriptionTableColumn, getEnabledTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import { ENABLED_OPTS } from '@/constants'

export default {
  name: 'DynamicschedtagList',
  mixins: [WindowsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'dynamicschedtags',
        getParams: { details: true },
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains('${val}')`
            },
          },
          'enabled': {
            label: '启用状态',
            dropdown: true,
            multiple: true,
            items: ENABLED_OPTS,
          },
          'schedpolicies': {
            label: '调度标签',
            filter: true,
            jointFilter: true,
            formatter: val => {
              return `schedtags.id(schedtag_id).name.contains("${val}")`
            },
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '启用状态', key: 'enabled' },
          { label: '调度标签', key: 'schedtag' },
          { label: '条件', key: 'condition' },
        ],
      },
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'DynamicschedtagSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        getEnabledTableColumn(),
        getCopyWithContentTableColumn({
          field: 'schedtag',
          title: '调度标签',
        }),
        getCopyWithContentTableColumn({
          field: 'condition',
          title: '条件',
        }),
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('CreateDynamicschedtagDialog', {
              title: '创建动态调度标签',
              list: this.list,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: '删除',
          action: () => {
            this.createDialog('DeleteResDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: '删除动态调度标签',
              list: this.list,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
      singleActions: [
        {
          label: '启用',
          action: obj => {
            this.list.singleUpdate(obj.id, { enabled: true })
          },
          meta: obj => {
            return {
              validate: !obj.enabled,
            }
          },
        },
        {
          label: '禁用',
          action: obj => {
            this.list.singleUpdate(obj.id, { enabled: false })
          },
          meta: obj => {
            return {
              validate: obj.enabled,
            }
          },
        },
        {
          label: '更多',
          actions: obj => {
            return [
              {
                label: '调整策略',
                action: () => {
                  this.createDialog('UpdateDynamicschedtagDialog', {
                    data: [obj],
                    columns: this.columns,
                    title: '调整策略',
                    list: this.list,
                  })
                },
              },
              {
                label: '删除',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    data: [obj],
                    columns: this.columns,
                    title: '删除动态调度标签',
                    list: this.list,
                  })
                },
                meta: () => {
                  return {
                    validate: obj.can_delete,
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
    this.initSidePageTab('dynamicschedtag-detail')
    this.list.fetchData()
  },
}
</script>
