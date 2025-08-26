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
import Detail from './Detail'

export default {
  name: 'SystemCachedImageSidePage',
  components: {
    Detail,
  },
  mixins: [SidePageMixin, WindowsMixin],
  computed: {
    detailTabs () {
      return [
        { label: this.$t('compute.text_238'), key: 'detail' },
        // { label: this.$t('compute.text_240'), key: 'event-drawer' },
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
    getParams () {
      if (this.params.windowData.currentTab === 'event-drawer') {
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
