<template>
  <page-list
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions" />
</template>

<script>
import { sizestr } from '@/utils/utils'
import { getStatusTableColumn, getRegionTableColumn, getBrandTableColumn, getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'
import { getNameFilter, getStatusFilter } from '@/utils/common/tableFilter'

export default {
  name: 'RedisBackupList',
  mixins: [WindowsMixin, ListMixin],
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
            label: this.$t('db.text_36'),
            dropdown: true,
            multiple: true,
            items: [
              { label: this.$t('db.text_316'), key: 'manual' },
              { label: this.$t('db.text_317'), key: 'automated' },
            ],
          },
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          onManager: this.onManager,
        }),
        {
          field: 'backup_mode',
          title: this.$t('db.text_36'),
          width: 100,
          slots: {
            default: ({ row }) => {
              return row.backup_mode === 'manual' ? this.$t('db.text_316') : this.$t('db.text_317')
            },
          },
        },
        {
          field: 'engine',
          title: this.$t('db.text_112'),
          width: 100,
          slots: {
            default: ({ row }) => {
              return `${row.engine} ${row.engine_version}`
            },
          },
        },
        {
          field: 'backup_size_mb',
          title: this.$t('db.text_38'),
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
          title: this.$t('db.text_39'),
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
          label: this.$t('db.text_41'),
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
              tooltip = this.$t('db.text_318')
            }
            if (this.data.status !== 'running') {
              validate = false
              tooltip = this.$t('db.text_156')
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
          label: this.$t('db.text_45'),
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
              tooltip = this.$t('db.text_319')
            }
            if (row.status !== 'running' && row.status !== 'success') {
              validate = false
              tooltip = this.$t('db.text_320')
            }
            if (this.data.brand === 'Qcloud') {
              validate = false
              tooltip = this.$t('db.text_356')
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
        tooltip: isHuawei ? this.$t('db.text_321') : null,
      }
    },
  },
  created () {
    this.list.fetchData()
  },
}
</script>
