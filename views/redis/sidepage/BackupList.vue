<template>
  <page-list
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions" />
</template>

<script>
import { sizestr } from '@/utils/utils'
import { getStatusTableColumn, getRegionTableColumn, getBrandTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'
import { getNameFilter, getStatusFilter } from '@/utils/common/tableFilter'

export default {
  name: 'RedisBackupList',
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
        resource: 'elasticcachebackups',
        getParams: this.params,
        steadyStatus: Object.values(expectStatus.redisBackup).flat(),
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter('redisBackup'),
          // brand: {
          //   label: '平台',
          //   dropdown: true,
          //   multiple: true,
          //   items: [
          //     { label: '阿里云', key: 'Aliyun' },
          //     { label: '华为云', key: 'Huawei' },
          //   ],
          // },
          backup_mode: {
            label: '备份类型',
            dropdown: true,
            multiple: true,
            items: [
              { label: '手动备份', key: 'manual' },
              { label: '自动备份', key: 'automated' },
            ],
          },
        },
      }),
      columns: [
        getCopyWithContentTableColumn(),
        {
          field: 'backup_mode',
          title: '备份类型',
          width: 100,
          slots: {
            default: ({ row }) => {
              return row.backup_mode === 'manual' ? '手动备份' : '自动备份'
            },
          },
        },
        {
          field: 'engine',
          title: '类型版本',
          width: 100,
          slots: {
            default: ({ row }) => {
              return `${row.engine} ${row.engine_version}`
            },
          },
        },
        {
          field: 'backup_size_mb',
          title: '大小',
          width: 100,
          slots: {
            default: ({ row }) => {
              return sizestr(row.backup_size_mb, 'M', 1024)
            },
          },
        },
        getBrandTableColumn(),
        getStatusTableColumn({ statusModule: 'redisBackup' }),
        {
          title: '备份开始/结束时间',
          minWidth: 150,
          slots: {
            default: ({ row }) => {
              if (row.start_time && row.end_time) {
                return [
                  <div>{this.$moment(row.start_timet).format()}</div>,
                  <div>{this.$moment(row.end_time).format()}</div>,
                ]
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
            let validate = true
            let tooltip = ''
            // if (this.data.brand === 'Huawei' && this.data.local_category === 'single') {
            //   validate = false
            //   tooltip = '华为云基础版不支持此操作'
            // }
            if (this.data.brand === 'Huawei') {
              validate = false
              tooltip = '华为云暂时不支持此操作'
            }
            if (this.data.status !== 'running') {
              validate = false
              tooltip = '仅运行中的实例支持此操作'
            }
            return {
              buttonType: 'primary',
              validate,
              tooltip,
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
          meta: (row) => {
            let validate = true
            let tooltip = ''
            if (this.data.brand === 'Huawei' && this.data.arch_type === 'single') {
              validate = false
              tooltip = '华为云基础版不支持此操作'
            }
            if (row.status !== 'running') {
              validate = false
              tooltip = '仅正常状态下的备份支持此操作'
            }
            return {
              validate,
              tooltip,
            }
          },
        },
      ],
    }
  },
  computed: {
    commonMeta () {
      const isHuawei = this.data.brand === 'Huawei'
      return {
        validate: !isHuawei,
        tooltip: isHuawei ? '华为云不支持创建白名单' : null,
      }
    },
  },
  created () {
    this.list.fetchData()
  },
}
</script>
