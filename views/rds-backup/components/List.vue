<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import { getNameFilter, getFilter, getStatusFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'
import i18n from '@/locales'
const BACKUP_TYPE = {
  automated: i18n.t('db.text_33'),
  manual: i18n.t('db.text_34'),
}
export default {
  name: 'RDSBackupList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
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
        id: this.id,
        resource: 'dbinstancebackups',
        getParams: this.params,
        steadyStatus: Object.values(expectStatus.rdsBackup).flat(),
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter('rdsBackup'),
          // dbinstance: getFilter({
          //   field: 'dbinstance',
          //   title: '实例名称',
          // }),
          dbinstance: {
            field: 'dbinstance',
            label: this.$t('db.text_35'),
          },
          engine: getFilter({
            field: 'engine',
            title: this.$t('db.text_57'),
            multiple: true,
            items: [
              { label: 'MySQL', key: 'MySQL' },
              { label: 'PostgreSQL', key: 'PostgreSQL' },
              { label: 'SQLServer', key: 'SQLServer' },
            ],
          }),
          backup_mode: getFilter({
            field: 'backup_mode',
            title: this.$t('db.text_36'),
            items: Object.keys(BACKUP_TYPE).map(key => {
              return { label: BACKUP_TYPE[key], key }
            }),
          }),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('db.text_60'), key: 'name' },
          { label: this.$t('db.text_35'), key: 'dbinstance' },
          { label: this.$t('db.text_36'), key: 'backup_mode' },
          { label: this.$t('db.text_57'), key: 'engine' },
          { label: this.$t('db.text_38'), key: 'backup_size_mb' },
          { label: this.$t('db.text_46'), key: 'status' },
          { label: this.$t('db.text_210'), key: 'start_time' },
          { label: this.$t('db.text_211'), key: 'end_time' },
          { label: this.$t('db.text_40'), key: 'region' },
        ],
      },
      groupActions: [
        {
          label: this.$t('db.text_41'),
          permission: 'rds_dbinstancebackups_create',
          action: () => {
            this.createDialog('RDSBackupCreate', {
              rdsItem: this.data,
              onManager: this.onManager,
              refresh: this.refresh,
              list: this.list,
            })
          },
          meta: () => {
            let validate = true
            let tooltip = ''
            if (this.data.status !== 'running') {
              validate = false
              tooltip = this.$t('db.text_212')
            }
            if (this.data.provider === 'Qcloud' && this.data.category === 'basic') {
              validate = false
              tooltip = this.$t('db.text_342')
            }
            return {
              buttonType: 'primary',
              validate: validate,
              tooltip: tooltip,
            }
          },
        },
        {
          label: this.$t('db.text_213'),
          actions: () => {
            return [
              {
                label: this.$t('db.text_69'),
                action: () => {
                  this.onManager('batchPerformAction', {
                    steadyStatus: ['running', 'ready'],
                    managerArgs: {
                      action: 'syncstatus',
                    },
                  })
                },
              },
              {
                label: this.$t('db.text_42'),
                permission: 'rds_dbinstancebackups_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    name: this.$t('db.text_44'),
                    title: this.$t('db.text_43'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  if (this.data.brand === 'Aliyun') {
                    return {
                      validate: false,
                      tooltip: this.$t('db.text_214'),
                    }
                  }
                  return this.$getDeleteResult(this.list.selectedItems)
                },
              },
            ]
          },
          meta: () => {
            return {
              validate: this.list.selected.length,
            }
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
    this.initSidePageTab('rds-backup-detail')
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'RDSBackupSidePage', {
        id: row.id,
        resource: 'dbinstancebackups',
        getParams: this.params,
        steadyStatus: Object.values(expectStatus.rdsBackup).flat(),
      }, {
        list: this.list,
      })
    },
  },
}
</script>
