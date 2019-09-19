<template>
  <div>
    <page-header title="镜像" />
    <page-body>
      <page-list
        :list="list"
        :columns="columns" />
    </page-body>
  </div>
</template>

<script>
import { sizestr } from '@/utils/utils'
import { getStatusTableColumn } from '@/utils//common/tableColumn'
import SystemIcon from '@/sections/SystemIcon'

export default {
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'images',
        apiVersion: 'v1',
        getParams: this.getParams,
      }),
      columns: [
        { field: 'name', title: '名称' },
        { field: 'disk_format', title: '格式' },
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
