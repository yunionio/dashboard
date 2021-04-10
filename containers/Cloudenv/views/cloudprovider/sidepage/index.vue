<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('cloudenv.text_318')"
    icon="onecloud"
    :res-name="detailData.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :res-id="data.id" :cloudprovider-id="data.id" resource="cloudproviders" :data="detailData" :onManager="onManager" :getParams="getParams" />
  </base-side-page>
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import CloudaccountDetail from './Detail'
import CloudaccountQuotaList from './QuotaList'
import Usage from '@Cloudenv/sections/UsageSidepage'
import CloudproviderregionList from '@Cloudenv/views/cloudproviderregion/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'CloudproviderSidePage',
  components: {
    Actions,
    CloudaccountDetail,
    CloudproviderregionList,
    CloudaccountQuotaList,
    Usage,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('cloudenv.text_237'), key: 'cloudaccount-detail' },
        { label: this.$t('cloudenv.text_10'), key: 'cloudproviderregion-list' },
        { label: this.$t('cloudenv.text_362'), key: 'cloudaccount-quota-list' },
        { label: this.$t('cloudenv.text_319'), key: 'usage' },
        { label: this.$t('cloudenv.text_15'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.params.windowData.currentTab === 'cloudproviderregion-list') {
        return () => {
          return {
            cloudprovider_id: this.data.id,
            details: true,
          }
        }
      }
      return null
    },
  },
}
</script>
