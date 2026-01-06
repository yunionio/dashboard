<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('compute.deadly_resource')"
    icon="res-disk"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :loaded="loaded"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <component
      :is="params.windowData.currentTab"
      :res-id="data.id"
      :id="listId"
      :data="detailData"
      :on-manager="onManager"
      :columns="columns" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Detail from './Detail'

export default {
  name: 'DeadlyResourceSidePage',
  components: {
    Detail,
  },
  mixins: [SidePageMixin, WindowsMixin],
  computed: {
    detailTabs () {
      return [
        { label: this.$t('common.text00017'), key: 'deadly-resource-detail' },
      ]
    },
    listId () {
      return ''
    },
  },
}
</script>
