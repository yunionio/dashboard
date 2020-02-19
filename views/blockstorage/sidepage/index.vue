<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="块存储"
    icon="res-blockstorage"
    :res-name="data.name"
    :actions="params.actions"
    :tabs="detailTabs"
    :current-tab="params.windowData.currentTab"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="params.singleActions" :row="data" button-type="link" button-size="small" />
    </template>
    <component v-bind="hostListActions" :is="params.windowData.currentTab" :data="data" :list="params.list" :getParams="getParams" :getColumns="getColumns" :res-id="getParams.storage" />
  </base-side-page>
</template>

<script>
import DiskList from '@Compute/views/disk/components/List'
import HostList from '@Compute/views/host/components/List'
import DiskRecoveryList from '@Compute/views/disk-recovery/components/List'
import CachedImages from '@Storage/views/blockstorage/sidepage/CachedImages'
import Detail from './Detail'
import { getStatusTableColumn, getCopyWithContentTableColumn, getProjectTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

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
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'detail' },
        { label: '宿主机', key: 'host-list' },
        { label: '硬盘', key: 'disk-list' },
        { label: '回收站', key: 'disk-recovery-list' },
        { label: '镜像缓存', key: 'cached-images' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return {
        storage: this.params.resId,
        details: true,
      }
    },
    getColumns () {
      if (this.params.windowData.currentTab === 'disk-recovery-list') {
        return [
          getCopyWithContentTableColumn({ field: 'name', title: '名称' }),
          getCopyWithContentTableColumn({ field: 'guest', title: '云服务器' }),
          {
            field: 'disk_type',
            title: '类型',
            width: 70,
            formatter: ({ cellValue }) => {
              return cellValue === 'sys' ? '系统盘' : '数据盘'
            },
          },
          getStatusTableColumn({ statusModule: 'disk' }),
          getProjectTableColumn(),
          getTimeTableColumn({ field: 'auto_delete_at', title: '自动清除时间' }),
        ]
      }
      return null
    },
    data () {
      return this.params.list.data[this.params.resId].data
    },
    isBlockStorage () {
      return ['rbd', 'nfs', 'gpfs'].includes(this.data.storage_type)
    },
    hostListActions () {
      const me = this
      return {
        // this = hostList
        frontGroupActions: function () {
          return [
            {
              label: '取消关联宿主机',
              action: () => {
                this.createDialog('UnAssociatedHostDialog', {
                  title: '取消关联宿主机',
                  data: this.list.selectedItems,
                  columns: this.columns,
                  list: this.list,
                  resId: me.params.resId,
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
              label: '取消关联宿主机',
              action: (row) => {
                this.createDialog('UnAssociatedHostDialog', {
                  title: '取消关联宿主机',
                  data: [row],
                  columns: this.columns,
                  list: this.list,
                  resId: me.params.resId,
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
