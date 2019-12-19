<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="镜像"
    icon="res-image"
    :res-name="data.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="params.singleActions" :row="data" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :res-id="params.resId" :data="data" :list="params.list" :getParams="getParams" />
  </base-side-page>
</template>

<script>
import ChildrenImageList from '../../host-image/sidepage/ChildrenImage'
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
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {}
  },
  computed: {
    getParams () {
      return null
    },
    data () {
      return this.params.list.data[this.params.resId].data
    },
    detailTabs () {
      const isHostImage = this.params.list.data[this.params.resId].data.root_image
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
