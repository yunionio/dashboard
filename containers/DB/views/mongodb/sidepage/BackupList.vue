<template>
  <page-list
    :columns="columns"
    :list="list" />
</template>

<script>
import { sizestr } from '@/utils/utils'
import { getStatusTableColumn, getRegionTableColumn, getBrandTableColumn, getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'
import { getNameFilter, getStatusFilter } from '@/utils/common/tableFilter'

export default {
  name: 'MongodbBackupList',
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
        id: 'MongodbBackupListForMongoDBSidePage',
        resource: this.fetchData,
        // apiVersion: 'v1',
        getParams: this.params,
        steadyStatus: Object.values(expectStatus.redisBackup).flat(),
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter('redisBackup'),
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
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    async fetchData (params) {
      try {
        const managerArgs = {
          id: this.data.id,
          spec: 'backups',
          params: {
            details: true,
            ...params,
          },
        }
        const res = await new this.$Manager('mongodbs', 'v2').getSpecific(managerArgs)
        return res
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
