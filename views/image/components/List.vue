<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
import { sizestr } from '@/utils/utils'
import { getStatusTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import SystemIcon from '@/sections/SystemIcon'

export default {
  name: 'ImageList',
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'images',
        apiVersion: 'v1',
        getParams: this.getParams,
        filterOptions: {
          name: {
            label: '镜像名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
          disk_format: {
            label: '镜像格式',
            dropdown: true,
            items: [
              { label: 'VMDK', key: 'vmdk' },
              { label: 'RAW', key: 'raw' },
              { label: 'VHD', key: 'vhd' },
              { label: 'QCOW2', key: 'qcow2' },
              { label: 'ISO', key: 'iso' },
            ],
          },
          is_standard: {
            label: '镜像类型',
            dropdown: true,
            items: [
              { label: '标准镜像', key: true },
              { label: '非标准镜像', key: false },
            ],
          },
        },
      }),
      columns: [
        getCopyWithContentTableColumn({ field: 'name', title: '名称' }),
        {
          field: 'disk_format',
          title: '格式',
          formatter: ({ cellValue }) => {
            return cellValue && cellValue.toUpperCase()
          },
        },
        {
          field: 'os_type',
          title: '系统',
          slots: {
            default: ({ row }) => {
              if (!row.properties) return
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
          field: 'size',
          title: '镜像大小',
          formatter: ({ cellValue }) => {
            return sizestr(cellValue, 'B', 1024)
          },
        },
        {
          field: 'is_standard',
          title: '镜像类型',
          formatter: ({ cellValue }) => {
            if (cellValue) return '标准镜像'
            return '非标准镜像'
          },
        },
        getStatusTableColumn({ statusModule: 'image' }),
        {
          field: 'created_at',
          title: '创建时间',
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
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
      }
    },
  },
}
</script>
