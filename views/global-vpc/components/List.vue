<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions" />
</template>

<script>
import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getEnabledTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'globalVpcList',
  mixins: [WindowsMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'globalvpcs',
        getParams: {
          details: true,
        },
        filterOptions: {
          model: {
            label: '设备型号',
            filter: true,
            formatter: val => {
              return `model.contains(${val})`
            },
          },
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          addLock: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'globalVpcSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        getStatusTableColumn({ statusModule: 'globalVpc' }),
        getEnabledTableColumn(),
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('GlobalVpcCreateDialog', {
              title: '新建全局VPC',
              list: this.list,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
      ],
      singleActions: [
        {
          label: '删除',
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              title: '删除',
              data: [obj],
              columns: this.columns,
              list: this.list,
              alert: '提示：请确保存储桶下所有目录和文件已删空，删除后数据不可恢复和访问。',
            })
          },
          meta: obj => {
            return {
              validate: obj.can_delete,
              tooltip: obj.delete_fail_reason,
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
}
</script>
