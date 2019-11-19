<template>
  <page-list
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions" />
</template>

<script>
import { getStatusTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'
import { sizestr } from '@/utils/utils'
const BACKUP_TYPE = {
  automated: '自动',
  manual: '手动',
}
export default {
  name: 'RDSBAckupList',
  mixins: [WindowsMixin],
  props: {
    params: {
      type: Object,
    },
    data: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'dbinstancebackups',
        getParams: this.params,
        steadyStatus: Object.values(expectStatus.redisAccount).flat(),
      }),
      columns: [
        {
          field: 'name',
          title: '名称',
        },
        {
          field: 'dbinstance',
          title: '实例名称',
        },
        {
          field: 'backup_mode',
          title: '备份类型',
          slots: {
            default: ({ row }) => {
              return BACKUP_TYPE[row.backup_mode]
            },
          },
        },
        {
          id: 'engine',
          header: '数据库类型',
          slots: {
            default: ({ row }) => {
              return `${row.engine || ''} ${row.engine_version || ''}`
            },
          },
        },
        {
          id: 'backup_size_mb',
          header: '大小',
          slots: {
            default: ({ row }) => {
              return sizestr(row.backup_size_mb, 'M', 1024)
            },
          },
        },
        getStatusTableColumn({ statusModule: 'rdsBackup' }),
        // getBrandTableColumn(),
        {
          header: '备份开始/结束时间',
          slots: {
            default: ({ row }) => {
              return `${this.$moment(row.start_time).format()} - ${this.$moment(row.end_time).format()}`
            },
          },
        },
        {
          id: 'region',
          header: '区域',
        },
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('RDSBackupCreate', {
              list: this.list,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              ...this.commonMeta,
            }
          },
        },
      ],
      singleActions: [
      ],
    }
  },
  computed: {
    commonMeta () {
      const isRun = this.data.status === 'running'
      let tooltip = ''
      if (!isRun) {
        tooltip = '仅在运行中状态下支持新建操作'
      }
      return {
        validate: isRun,
        tooltip: tooltip,
      }
    },
  },
  created () {
    this.list.fetchData()
  },
}
</script>
