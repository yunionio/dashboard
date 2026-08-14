<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :showSingleActions="showActions"
    :showGroupActions="showActions" />
</template>

<script>
import SingleActionsMixin from '@Compute/views/disk-backup/mixins/singleActions'
import ColumnsMixin from '@Compute/views/disk-backup/mixins/columns'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'
import ListMixin from '@/mixins/list'

export default {
  name: 'DiskBackupListForDiskSidePage',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    resId: String,
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      deleteResProps: {
        force: false,
      },
      list: this.$list.createList(this, {
        ctx: this,
        id: 'DiskBackupListForDiskSidePage',
        resource: 'diskbackups',
        steadyStatus: Object.values(expectStatus.diskBackup).flat(),
        getParams: {
          details: true,
          disk_id: this.resId,
          scope: 'max',
        },
        filterOptions: {
          name: {
            label: this.$t('compute.text_415'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
      }),
      groupActions: [
        {
          label: this.$t('compute.perform_sync_status'),
          permission: 'diskbackups_perform_syncstatus',
          action: () => {
            this.onManager('batchPerformAction', {
              steadyStatus: ['running', 'ready'],
              managerArgs: {
                action: 'syncstatus',
              },
            })
          },
          meta: () => {
            const hasSaving = this.list.selectedItems.some(item => item.status === 'saving')
            return {
              validate: this.list.selected.length && !hasSaving,
              tooltip: hasSaving ? this.$t('compute.text_1397') : '',
            }
          },
        },
        {
          label: this.$t('compute.perform_delete'),
          permission: 'diskbackups_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
              title: this.$t('compute.perform_delete'),
              name: this.$t('compute.disk_backup'),
            })
          },
          meta: () => {
            const ret = {
              validate: this.list.selected.length,
              tooltip: null,
            }
            if (this.list.selectedItems.some(item => !item.can_delete)) {
              ret.validate = false
              return ret
            }
            return ret
          },
        },
      ],
    }
  },
  computed: {
    showActions () {
      return !this.$isScopedPolicyMenuHidden('disk_backup_hidden_columns.perform_action')
    },
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'DiskBackupSidePage', {
        id: row.id,
        resource: 'diskbackups',
        getParams: {
          details: true,
          with_meta: true,
          is_instance_backup: false,
          disk_id: this.resId,
        },
        steadyStatus: this.list.steadyStatus,
      }, {
        list: this.list,
        tab,
      })
    },
  },
}
</script>
