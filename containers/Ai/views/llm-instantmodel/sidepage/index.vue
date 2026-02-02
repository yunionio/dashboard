<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('aice.mounted_apps')"
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
      :res-id="getResId"
      cloud-env="onpremise"
      :id="listId"
      :data="detailData"
      :getParams="getParams"
      :on-manager="onManager"
      :columns="columns"
      @refresh="refresh" />
  </base-side-page>
</template>

<script>
import CachedImageEventDrawer from '@Compute/views/image/sidepage/CachedImageEventList'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import CacheList from '@Compute/views/image/sidepage/Cache'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import Detail from './Detail'

export default {
  name: 'LlmInstantModelSidePage',
  components: {
    Detail,
    CacheList,
    Actions,
    CachedImageEventDrawer,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('aice.detail'), key: 'detail' },
        // { label: this.$t('compute.text_692'), key: 'cache-list' },
        { label: this.$t('aice.event'), key: 'event-drawer' },
        // { label: this.$t('dictionary.cachedimage') + this.$t('compute.text_240'), key: 'cached-image-event-drawer' },
      ],
    }
  },
  computed: {
    getResId () {
      switch (this.params.windowData.currentTab) {
        case 'cache-list':
          return this.data.data.image_id
        case 'cached-image-event-drawer':
          return this.data.data.image_id
      }
      return this.data.id
    },
    getParams () {
      if (this.params.windowData.currentTab === 'event-drawer') {
        return { obj_type: 'llm_instant_model' }
      }
      if (this.params.windowData.currentTab === 'cached-image-event-drawer') {
        return { obj_type: 'cachedimage' }
      }
      return {}
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForInstantAppSidePage'
        case 'cached-image-event-drawer':
          return 'EventListForCachedSystemImageSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
