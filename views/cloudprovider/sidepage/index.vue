<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="订阅"
    icon="onecloud"
    :res-name="data.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="params.singleActions" :row="data" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :res-id="params.resId" :data="data" :list="params.list" :cloudprovider-id="params.resId" :getParams="getParams" />
  </base-side-page>
</template>

<script>
import CloudproviderregionList from '@Cloudenv/views/cloudproviderregion/components/List'
import ExternalprojectList from '@Cloudenv/views/externalproject/components/List'
import CloudaccountDetail from './Detail'
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
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'cloudaccount-detail' },
        { label: '区域', key: 'cloudproviderregion-list' },
        { label: this.$t('dictionary.project'), key: 'externalproject-list' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.params.windowData.currentTab === 'cloudproviderregion-list') {
        return () => {
          return {
            cloudprovider_id: this.params.resId,
            details: true,
          }
        }
      } else if (this.params.windowData.currentTab === 'externalproject-list') {
        return () => {
          return {
            manager_id: this.params.resId,
          }
        }
      }
      return null
    },
    data () {
      return this.params.list.data[this.params.resId].data
    },
  },
}
</script>
