<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="云账号"
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
    <component :is="params.windowData.currentTab" :data="detailData" :on-manager="onManager" :res-id="data.id" resource="cloudaccounts" :cloudaccount-list-refresh="params.options.refresh" :getParams="getParams" />
  </base-side-page>
</template>

<script>
import CloudproviderList from '@Cloudenv/views/cloudprovider/components/List'
import HostList from '@Compute/views/host/components/List'
import Usage from '@Cloudenv/sections/UsageSidepage'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import CloudaccountDetail from './Detail'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import { findPlatform } from '@/utils/common/hypervisor'

export default {
  name: 'CloudaccountSidePage',
  components: {
    Actions,
    CloudaccountDetail,
    CloudproviderList,
    HostList,
    Usage,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  computed: {
    detailTabs () {
      const data = this.detailData
      let platform = 'idc'
      if (data.provider) {
        platform = findPlatform(data.provider.toLowerCase(), 'provider')
      }
      const detailTabs = [
        { label: '详情', key: 'cloudaccount-detail' },
        { label: '订阅', key: 'cloudprovider-list' },
        { label: '资源统计', key: 'usage' },
        { label: '操作日志', key: 'event-drawer' },
      ]
      if (platform === 'idc' || platform === 'private') {
        detailTabs.splice(1, 0, { label: '宿主机', key: 'host-list' })
      }
      return detailTabs
    },
    getParams () {
      if (this.params.windowData.currentTab === 'cloudprovider-list') {
        return {
          detail: true,
          cloudaccount_id: this.data.id,
        }
      } else if (this.params.windowData.currentTab === 'host-list') {
        return {
          detail: true,
          account: this.data.id,
          baremetal: false,
        }
      }
      return null
    },
  },
}
</script>
