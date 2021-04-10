<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.cloudgroupcache')"
    icon="res-cloudaccount"
    :res-name="detailData.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :data="detailData" :on-manager="onManager" :res-id="data.id" :getParams="getParams" />
  </base-side-page>
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import CloudgroupcacheDetail from './Detail'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'CloudgroupcacheSidePage',
  components: {
    Actions,
    CloudgroupcacheDetail,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('sidepage.tab.label.detail'), key: 'cloudgroupcache-detail' },
        { label: this.$t('dictionary.actions'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return null
    },
  },
}
</script>
