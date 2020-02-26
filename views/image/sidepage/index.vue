<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="镜像"
    icon="res-image"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
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
      :is="params.windowData.currentTab"
      :res-id="data.id"
      :data="detailData"
      :resource="resource"
      :on-manager="onManager"
      @refresh="refresh" />
  </base-side-page>
</template>

<script>
import ChildrenImageList from '../../host-image/sidepage/ChildrenImage'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import SystemImageDetail from './Detail'
import CacheList from './Cache'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'SystemImageSidePage',
  components: {
    SystemImageDetail,
    CacheList,
    ChildrenImageList,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, SingleActionsMixin, ColumnsMixin],
  computed: {
    detailTabs () {
      const isHostImage = this.data.root_image
      if (isHostImage) {
        return [
          { label: '详情', key: 'system-image-detail' },
          { label: '子镜像', key: 'children-image-list' },
          { label: '操作日志', key: 'event-drawer' },
        ]
      }
      if (this.$store.getters.isAdminMode && !isHostImage) {
        return [
          { label: '详情', key: 'system-image-detail' },
          { label: '缓存列表', key: 'cache-list' },
          { label: '操作日志', key: 'event-drawer' },
        ]
      }
      return [
        { label: '详情', key: 'system-image-detail' },
        { label: '操作日志', key: 'event-drawer' },
      ]
    },
  },
}
</script>
