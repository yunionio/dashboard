<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import expectStatus from '@/constants/expectStatus'
import { getNameFilter, getStatusFilter, getOsTypeFilter } from '@/utils/common/tableFilter'
import { getStatusTableColumn, getCopyWithContentTableColumn, getProjectTableColumn } from '@/utils/common/tableColumn'
import SystemIcon from '@/sections/SystemIcon'
import WindowsMixin from '@/mixins/windows'
import { sizestr } from '@/utils/utils'

export default {
  name: 'ImageRecoveryList',
  mixins: [WindowsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'images',
        getParams: this.getParams,
        steadyStatus: Object.values(expectStatus.server).flat(),
        apiVersion: 'v1',
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter(),
          os_type: getOsTypeFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '格式', key: 'disk_format' },
          { label: '镜像大小', key: 'size' },
          { label: '项目', key: 'tenant' },
          { label: '镜像类型', key: 'is_standard' },
          { label: '创建时间', key: 'created_at' },
          { label: '检验和', key: 'checksum' },
        ],
      },
      columns: [
        getCopyWithContentTableColumn({ field: 'name', title: '名称' }),
        {
          field: 'os_type',
          title: '操作系统',
          width: 70,
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
          width: 100,
        },
        {
          field: 'size',
          title: '镜像大小',
          width: 100,
          formatter: ({ cellValue }) => {
            return sizestr(cellValue, 'B', 1024)
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
            this.createDialog('DeleteResDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: '清除',
              list: this.list,
              requestParams: { override_pending_delete: true },
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
            this.createDialog('ImageRestoreDialog', {
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
            this.createDialog('DeleteResDialog', {
              data: [obj],
              columns: this.columns,
              title: '清除',
              list: this.list,
              requestParams: { override_pending_delete: true },
            })
          },
          meta: obj => this.$getDeleteResult(obj),
        },
        {
          label: '恢复',
          permission: 'images_perform_cancel_delete',
          action: (obj) => {
            this.createDialog('ImageRestoreDialog', {
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
