<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.clouduser')"
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
    <component
      :is="params.windowData.currentTab"
      :data="detailData"
      :cloudaccount="cloudaccount"
      :on-manager="onManager"
      :res-id="data.id"
      resource="cloudaccounts"
      :getParams="getParams" />
  </base-side-page>
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ClouduserDetail from './Detail'
import CloudgroupList from './CloudgroupList'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'ClouduserSidePage',
  components: {
    ClouduserDetail,
    CloudgroupList,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      cloudaccount: {},
      detailTabs: [
        { label: this.$t('sidepage.tab.label.detail'), key: 'clouduser-detail' },
        { label: this.$t('dictionary.cloudgroup'), key: 'cloudgroup-list' },
        { label: this.$t('dictionary.actions'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (
        this.params.windowData.currentTab === 'cloudgroup-list'
      ) {
        return {
          clouduser_id: this.data.id,
        }
      }
      return null
    },
  },
  destroyed () {
    this.cm = null
  },
  created () {
    this.cm = new this.$Manager('cloudaccounts')
  },
  methods: {
    async fetchDataCallback () {
      try {
        const response = await this.cm.get({ id: this.detailData.cloudaccount_id })
        this.cloudaccount = response.data
        return response
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
