<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import expectStatus from '@/constants/expectStatus'
import { getStatusTableColumn, getCopyWithContentTableColumn, getProjectTableColumn } from '@/utils/common/tableColumn'
import SystemIcon from '@/sections/SystemIcon'
import WindowsMixin from '@/mixins/windows'
import { sizestr } from '@/utils/utils'

export default {
  name: 'ImageRecoveryList',
  mixins: [WindowsMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'images',
        getParams: this.getParams,
        steadyStatus: Object.values(expectStatus.server).flat(),
        apiVersion: 'v1',
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
        },
      }),
      columns: [
        getCopyWithContentTableColumn({ field: 'name', title: '名称' }),
        {
          field: 'os_type',
          title: '操作系统',
          slots: {
            default: ({ row }) => {
              if (!row.properties || !row.properties.os_distribution) return
              let name = !row.properties.os_distribution ? row.properties.os_type : decodeURI(row.properties.os_distribution || '')
              if (name.includes('Windows') || name.includes('windows')) {
                name = 'Windows'
              }
              const tooltip = row.properties.os_version ? `${name} ${row.properties.os_version}` : name
              return [
                <SystemIcon tooltip={ tooltip } name={ name } />,
              ]
            },
          },
        },
        {
          field: 'disk_format',
          title: '格式',
        },
        {
          field: 'size',
          title: '镜像大小',
          formatter: ({ cellValue }) => {
            return sizestr(cellValue, 'M', 1024)
          },
        },
        getStatusTableColumn({ statusModule: 'image' }),
        getProjectTableColumn(),
      ],
      groupActions: [
        {
          label: '清除',
          permission: 'images_delete',
          action: () => {
            this.createDialog('RemoveDialog', {
              title: '清除',
              data: this.list.selectedItems,
              columns: this.columns,
              list: this.list,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
        {
          label: '恢复',
          permission: 'images_perform_cancel_delete',
          action: () => {
            this.createDialog('RestoreDialog', {
              title: '恢复',
              data: this.list.selectedItems,
              columns: this.columns,
              list: this.list,
            })
          },
          meta: () => {
            if (this.list.selectedItems.length > 0 && this.list.selectedItems.find(v => v.status === 'deleting') === undefined) {
              return {
                validate: true,
              }
            }
            return {
              validate: false,
            }
          },
        },
      ],
      singleActions: [
        {
          label: '清除',
          permission: 'images_delete',
          action: obj => {
            this.createDialog('RemoveDialog', {
              data: [obj],
              columns: this.columns,
              list: this.list,
            })
          },
          meta: obj => this.$getDeleteResult(obj),
        },
        {
          label: '恢复',
          permission: 'images_perform_cancel_delete',
          action: (obj) => {
            this.createDialog('RestoreDialog', {
              data: [obj],
              columns: this.columns,
              list: this.list,
            })
          },
          meta: obj => {
            return {
              validate: obj.status !== 'deleting',
            }
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParams () {
      return {
        details: true,
        pending_delete: true,
        is_guest_image: false,
      }
    },
  },
}
</script>
