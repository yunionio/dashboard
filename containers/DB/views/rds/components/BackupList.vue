<template>
  <page-list
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions" />
</template>

<script>
import { getStatusTableColumn, getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'
import { sizestr } from '@/utils/utils'
import i18n from '@/locales'
const BACKUP_TYPE = {
  automated: i18n.t('db.text_33'),
  manual: i18n.t('db.text_34'),
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
        steadyStatus: Object.values(expectStatus.rdsBackup).flat(),
      }),
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          addLock: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={() => this.sidePageTriggerHandle(row.id, 'RDSBackupSidePage')}>{row.name}</side-page-trigger>
            )
          },
        }),
        {
          field: 'dbinstance',
          title: this.$t('db.text_35'),
        },
        {
          field: 'backup_mode',
          title: this.$t('db.text_36'),
          slots: {
            default: ({ row }) => {
              return BACKUP_TYPE[row.backup_mode]
            },
          },
        },
        {
          id: 'engine',
          title: this.$t('db.text_37'),
          slots: {
            default: ({ row }) => {
              return `${row.engine || ''} ${row.engine_version || ''}`
            },
          },
        },
        {
          id: 'backup_size_mb',
          title: this.$t('db.text_38'),
          slots: {
            default: ({ row }) => {
              return sizestr(row.backup_size_mb, 'M', 1024)
            },
          },
        },
        getStatusTableColumn({ statusModule: 'rdsBackup' }),
        // getBrandTableColumn(),
        {
          title: this.$t('db.text_39'),
          slots: {
            default: ({ row }) => {
              return `${this.$moment(row.start_time).format()} / ${this.$moment(row.end_time).format()}`
            },
          },
        },
        {
          id: 'region',
          title: this.$t('db.text_40'),
          slots: {
            default: ({ row }) => {
              return row.region
            },
          },
        },
      ],
      groupActions: [
        {
          label: this.$t('db.text_41'),
          action: () => {
            this.createDialog('RDSBackupCreate', {
              list: this.list,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('db.text_42'),
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('db.text_43'),
              list: this.list,
              name: this.$t('db.text_44'),
            })
          },
          meta: () => this.$getDeleteResult(this.list.selectedItems),
        },
      ],
      singleActions: [
        {
          label: this.$t('db.text_45'),
          action: (obj) => {
            this.createDialog('RDSBackupRecovery', {
              title: this.$t('db.text_45'),
              data: [obj],
              columns: this.columns,
              list: this.list,
            })
          },
        },
        {
          label: this.$t('db.text_42'),
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              title: this.$t('db.text_42'),
              data: [obj],
              columns: this.columns,
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
