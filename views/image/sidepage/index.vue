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
      :id="listId"
      :data="detailData"
      :resource="resource"
      :on-manager="onManager"
      :columns="columns"
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
      if (this.$store.getters.isAdminMode) {
        return [
          { label: this.$t('compute.text_238'), key: 'system-image-detail' },
          { label: this.$t('compute.text_692'), key: 'cache-list' },
          { label: this.$t('compute.text_240'), key: 'event-drawer' },
        ]
      }
      return [
        { label: this.$t('compute.text_238'), key: 'system-image-detail' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ]
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForSystemImageSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
