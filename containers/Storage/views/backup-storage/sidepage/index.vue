<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('compute.backup_storage')"
    icon="res-backup-storage"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component
      v-bind="hostListActions"
      :is="params.windowData.currentTab"
      :data="detailData"
      :on-manager="onManager"
      :refresh="refresh"
      @refresh="refresh"
      :list="params.list"
      :getParams="getParams"
      :columns="columns"
      :res-id="data.id"
      :id="listId" />
  </base-side-page>
</template>

<script>
import HostList from '@Compute/views/host/components/List'
import Actions from '@/components/PageList/Actions'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import BackupStorageDetail from './Detail'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'BackupStorageSidePage',
  components: {
    BackupStorageDetail,
    Actions,
    HostList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('compute.text_238'), key: 'backup-storage-detail' },
        { label: this.$t('storage.text_50'), key: 'host-list' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return {
        backupstorage: this.data.id,
        details: true,
      }
    },
    hostListActions () {
      const me = this
      return {
        // this = hostList
        frontGroupActions: function () {
          return [
            {
              label: this.$t('storage.text_66'),
              permission: 'hostbackupstorages_create',
              action: () => {
                this.createDialog('HostAttachBackupStorageDialog', {
                  data: [me.detailData],
                  columns: me.columns,
                  title: this.$t('storage.text_66'),
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
            },
            {
              label: this.$t('storage.text_90'),
              permission: 'hostbackupstorages_delete',
              action: () => {
                this.createDialog('HostDetachBackupStorageDialog', {
                  title: this.$t('storage.text_90'),
                  data: this.list.selectedItems,
                  columns: this.columns,
                  list: this.list,
                  resId: me.getParams.backupstorage,
                })
              },
              meta: () => {
                return {
                  validate: this.list.selectedItems.length > 0,
                }
              },
            },
          ]
        },
        frontSingleActions: function () {
          return [
            {
              label: this.$t('storage.text_90'),
              permission: 'hostbackupstorages_delete',
              action: (row) => {
                this.createDialog('HostDetachBackupStorageDialog', {
                  title: this.$t('storage.text_90'),
                  data: [row],
                  columns: this.columns,
                  list: this.list,
                  resId: me.getParams.backupstorage,
                })
              },
            },
          ]
        },
      }
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'host-list':
          return 'HostListForBlockStorageSidePage'
        case 'event-drawer':
          return 'EventListForBackupStorageSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
