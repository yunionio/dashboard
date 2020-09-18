<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('storage.text_37')"
    icon="res-blockstorage"
    :res-name="detailData.name"
    :tabs="detailTabs"
    :current-tab="params.windowData.currentTab"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions
        :options="singleActions"
        :row="detailData"
        button-type="link"
        button-size="small" />
    </template>
    <component
      v-bind="hostListActions"
      :is="params.windowData.currentTab"
      :data="detailData"
      :resource="resource"
      :on-manager="onManager"
      :refresh="refresh"
      @refresh="refresh"
      :list="params.list"
      :getParams="getParams"
      :getColumns="getColumns"
      :res-id="getParams.storage" />
  </base-side-page>
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import Detail from './Detail'
import DiskList from '@Compute/views/disk/components/List'
import HostList from '@Compute/views/host/components/List'
import DiskRecoveryList from '@Compute/views/disk-recovery/components/List'
import CachedImages from '@Storage/views/blockstorage/sidepage/CachedImages'
import { getStatusTableColumn, getCopyWithContentTableColumn, getProjectTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import { STORAGE_TYPES } from '@Storage/constants/index.js'

export default {
  name: 'BlockStorageSidePage',
  components: {
    Actions,
    Detail,
    DiskList,
    DiskRecoveryList,
    HostList,
    CachedImages,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('storage.text_81'), key: 'detail' },
        { label: this.$t('storage.text_50'), key: 'host-list' },
        { label: this.$t('storage.text_82'), key: 'disk-list' },
        { label: this.$t('storage.text_83'), key: 'disk-recovery-list' },
        { label: this.$t('storage.text_84'), key: 'cached-images' },
        { label: this.$t('storage.text_85'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return {
        storage: this.data.id,
        details: true,
      }
    },
    getColumns () {
      if (this.params.windowData.currentTab === 'disk-recovery-list') {
        return [
          getCopyWithContentTableColumn({ field: 'name', title: this.$t('storage.text_40') }),
          getCopyWithContentTableColumn({ field: 'guest', title: this.$t('dictionary.server') }),
          {
            field: 'disk_type',
            title: this.$t('storage.text_86'),
            width: 70,
            formatter: ({ cellValue }) => {
              return cellValue === 'sys' ? this.$t('storage.text_87') : this.$t('storage.text_88')
            },
          },
          getStatusTableColumn({ statusModule: 'disk' }),
          getProjectTableColumn(),
          getTimeTableColumn({ field: 'auto_delete_at', title: this.$t('storage.text_89') }),
        ]
      }
      return null
    },
    isBlockStorage () {
      return ['rbd', 'nfs', 'gpfs'].includes(this.detailData.storage_type)
    },
    hostListActions () {
      const me = this
      return {
        // this = hostList
        frontGroupActions: function () {
          return [
            {
              label: this.$t('storage.text_66'),
              permission: 'storages_perform_storages',
              action: row => {
                this.createDialog('AssociatedHostDialog', {
                  data: [me.detailData],
                  columns: this.columns,
                  title: this.$t('storage.text_66'),
                  list: this.list,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: row => {
                return {
                  validate: me.isBlockStorage,
                  tooltip: !me.isBlockStorage && this.$t('storage.text_67', [STORAGE_TYPES[row.storage_type] || row.storage_type]),
                }
              },
            },
            {
              label: this.$t('storage.text_90'),
              action: () => {
                this.createDialog('UnAssociatedHostDialog', {
                  title: this.$t('storage.text_90'),
                  data: this.list.selectedItems,
                  columns: this.columns,
                  list: this.list,
                  resId: me.getParams.storage,
                })
              },
              meta: () => {
                return {
                  validate: this.list.selectedItems.length > 0 && me.isBlockStorage,
                }
              },
            },
          ]
        },
        frontSingleActions: function () {
          return [
            {
              label: this.$t('storage.text_90'),
              action: (row) => {
                this.createDialog('UnAssociatedHostDialog', {
                  title: this.$t('storage.text_90'),
                  data: [row],
                  columns: this.columns,
                  list: this.list,
                  resId: me.getParams.storage,
                })
              },
              meta: () => {
                return {
                  validate: me.isBlockStorage,
                }
              },
            },
          ]
        },
      }
    },
  },

}
</script>
