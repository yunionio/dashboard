<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import { BAND_WIDTH_OPTION } from '../../../constants'
import {
  getNameDescriptionTableColumn,
  getRegionTableColumn,
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'WireList',
  mixins: [ DialogMixin, WindowsMixin ],
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'wires',
        getParams: {
          details: true,
          show_emulated: false,
        },
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
          bandwidth: {
            label: '宽带',
            dropdown: true,
            multiple: true,
            items: BAND_WIDTH_OPTION.map(({ label, value }) => {
              return { label, key: value }
            }),
          },
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'WireSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'bandwidth',
          title: '带宽',
          width: 80,
          formatter: ({ cellValue }) => {
            const item = BAND_WIDTH_OPTION.find(val => val.value === `${cellValue}`)
            return item ? item.label : cellValue
          },
        },
        getCopyWithContentTableColumn({ field: 'vpc', title: '专有网络' }),
        {
          field: 'networks',
          title: '网络数量',
          width: 70,
        },
        getRegionTableColumn(),
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('WireCreateDialog', {
              title: '新建',
              list: this.list,
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: '删除',
          permission: 'wires_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: '删除',
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
          label: '修改属性',
          action: obj => {
            this.createDialog('WireUpdateDialog', {
              data: [obj],
              columns: this.columns,
              list: this.list,
            })
          },
        },
        {
          label: '删除',
          permission: 'wires_delete',
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              data: [obj],
              columns: this.columns,
              title: '删除',
              list: this.list,
            })
          },
          meta: (obj) => this.$getDeleteResult(obj),
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('wire-detail')
    this.list.fetchData()
  },
}
</script>
