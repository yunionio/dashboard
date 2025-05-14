<template>
  <page-list
    :columns="columns"
    :list="list" />
</template>

<script>
import { sizestr } from '@/utils/utils'
import { getStatusTableColumn, getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'
// import { getNameFilter, getStatusFilter } from '@/utils/common/tableFilter'

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
        idKey: 'name',
        resource: this.fetchData,
        getParams: this.params,
        steadyStatus: Object.values(expectStatus.mongodbBackup).flat(),
        // filterOptions: {
        // name: getNameFilter(),
        // status: getStatusFilter('mongodbBackup'),
        // backup_type: {
        //   label: this.$t('db.text_36'),
        //   dropdown: true,
        //   filter: true,
        //   items: [
        //     { label: this.$t('db.text_316'), key: 'manual' },
        //     { label: this.$t('db.text_317'), key: 'auto' },
        //   ],
        //   formatter: val => {
        //     return `backup_type.equals(${val})`
        //   },
        // },
        // },
      }),
      columns: [
        getNameDescriptionTableColumn({
          onManager: this.onManager,
        }),
        {
          field: 'backup_type',
          title: this.$t('db.text_36'),
          width: 100,
          slots: {
            default: ({ row }) => {
              return row.backup_type === 'manual' ? this.$t('db.text_316') : this.$t('db.text_317')
            },
          },
        },
        {
          field: 'backup_size_kb',
          title: this.$t('db.text_38'),
          width: 100,
          slots: {
            default: ({ row }) => {
              return sizestr(row.backup_size_kb, 'K', 1024)
            },
          },
        },
        getStatusTableColumn({ statusModule: 'mongodbBackup' }),
        {
          field: 'start_time',
          title: this.$t('db.text_39'),
          minWidth: 150,
          slots: {
            default: ({ row }) => {
              if (row.start_time && row.end_time) {
                return [
                  <div>{this.$moment(row.start_time).format()}</div>,
                  <div>{this.$moment(row.end_time).format()}</div>,
                ]
              }
              return '-'
            },
          },
        },
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
