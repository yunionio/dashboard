<template>
  <page-list
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions" />
</template>

<script>
import { getStatusTableColumn, getRegionTableColumn, getBrandTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'RedisBackupList',
  mixins: [WindowsMixin],
  props: {
    getParams: {
      type: Function,
    },
    data: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'elasticcachebackups',
        getParams: this.getParams,
      }),
      columns: [
        {
          field: 'name',
          title: '名称',
        },
        {
          field: 'backup_mode',
          title: '备份类型',
        },
        {
          field: 'name',
          title: '实例类型',
        },
        {
          field: 'name',
          title: '标签',
        },
        {
          field: 'backup_size_mb',
          title: '大小',
          slots: {
            default: ({ row }) => {
              return `${row.backup_size_mb}`
            },
          },
        },
        getBrandTableColumn(),
        getStatusTableColumn({ statusModule: 'redisBackup' }),
        {
          title: '备份开始/结束时间',
          slots: {
            default: ({ row }) => {
              if (row.start_time && row.end_time) {
                return `${row.start_time} ~ ${row.end_time}`
              }
              return '-'
            },
          },
        },
        getRegionTableColumn(),
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('BackupListCreate', {
              list: this.list,
              redisItem: this.data,
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
          label: '恢复',
          action: (obj) => {
            this.createDialog('RedisBackupResumeDialog', {
              data: [obj],
              columns: this.columns,
              list: this.list,
            })
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
