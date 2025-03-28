<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('compute.text_97')"
    icon="res-image"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-if="isStandalone" v-slot:actions>
      <actions
        :options="singleActions"
        :row="detailData"
        button-type="link"
        button-size="small"
        :before-show-menu="beforeShowMenu" />
    </template>
    <component
      :is="params.windowData.currentTab"
      :res-id="data.id"
      :id="listId"
      :data="detailData"
      :resource="resource"
      :on-manager="onManager"
      :columns="columns"
      :getParams="getParams"
      taskResource="image-tasks"
      @refresh="refresh" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import ChildrenImageList from '../../host-image/sidepage/ChildrenImage'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import SystemImageDetail from './Detail'
import CacheList from './Cache'
import CachedImageEventDrawer from './CachedImageEventList'

export default {
  name: 'SystemImageSidePage',
  components: {
    SystemImageDetail,
    CacheList,
    ChildrenImageList,
    CachedImageEventDrawer,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, SingleActionsMixin, ColumnsMixin],
  computed: {
    isStandalone () {
      if (this.data && this.data.data && [true, 'true'].includes(this.data.data.is_guest_image)) {
        return false
      }
      return true
    },
    detailTabs () {
      if (this.$store.getters.isAdminMode && this.isStandalone) {
        return [
          { label: this.$t('compute.text_238'), key: 'system-image-detail' },
          { label: this.$t('compute.text_692'), key: 'cache-list' },
          { label: this.$t('table.title.task'), key: 'task-drawer' },
          { label: this.$t('compute.text_240'), key: 'event-drawer' },
          { label: this.$t('dictionary.cachedimage') + this.$t('compute.text_240'), key: 'cached-image-event-drawer' },
        ]
      }
      return [
        { label: this.$t('compute.text_238'), key: 'system-image-detail' },
        { label: this.$t('table.title.task'), key: 'task-drawer' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ]
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForSystemImageSidePage'
        case 'cached-image-event-drawer':
          return 'EventListForCachedSystemImageSidePage'
        default:
          return ''
      }
    },
    getParams () {
      if (this.params.windowData.currentTab === 'event-drawer') {
        return { obj_type: 'image' }
      }
      if (this.params.windowData.currentTab === 'cached-image-event-drawer') {
        return { obj_type: 'cachedimage' }
      }
      return {}
    },
  },
  methods: {
    beforeShowMenu () {
      return this.$store.dispatch('scopedPolicy/get', {
        category: ['image_hidden_menus'],
      })
    },
  },
}
</script>
