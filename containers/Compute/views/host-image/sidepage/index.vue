<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('compute.text_98')"
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
      taskResource="compute-tasks"
      @tab-change="handleTabChange"
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
import HostImageDetail from './Detail'

export default {
  name: 'HostImageSidePage',
  components: {
    HostImageDetail,
    ChildrenImageList,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, SingleActionsMixin, ColumnsMixin],
  computed: {
    detailTabs () {
      return [
        { label: this.$t('compute.text_238'), key: 'host-image-detail' },
        { label: this.$t('table.title.child_image'), key: 'children-image-list' },
        { label: this.$t('table.title.task'), key: 'task-drawer' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ]
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForHostImageSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
