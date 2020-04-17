<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="订阅"
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
import CloudproviderregionList from '@Cloudenv/views/cloudproviderregion/components/List'
import ExternalprojectList from '@Cloudenv/views/externalproject/components/List'
import Usage from '@Cloudenv/sections/UsageSidepage'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import CloudaccountDetail from './Detail'
import CloudaccountQuotaList from './QuotaList'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'CloudproviderSidePage',
  components: {
    Actions,
    CloudaccountDetail,
    CloudproviderregionList,
    ExternalprojectList,
    CloudaccountQuotaList,
    Usage,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'cloudaccount-detail' },
        { label: '区域', key: 'cloudproviderregion-list' },
        { label: this.$t('dictionary.project'), key: 'externalproject-list' },
        { label: '配额', key: 'cloudaccount-quota-list' },
        { label: '资源统计', key: 'usage' },
        { label: '操作日志', key: 'event-drawer' },
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
      } else if (this.params.windowData.currentTab === 'externalproject-list') {
        return () => {
          return {
            manager_id: this.data.id,
          }
        }
      }
      return null
    },
  },
}
</script>
