<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="云账号"
    icon="res-cloudaccount"
    :res-name="data.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="params.singleActions" :row="data" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :data="data" :res-id="params.resId" :list="params.list" :getParams="getParams" />
  </base-side-page>
</template>

<script>
import CloudproviderList from '@Cloudenv/views/cloudprovider/components/List'
import HostList from '@Compute/views/host/components/List'
import CloudaccountDetail from './Detail'
import Dashboard from './Dashboard'
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
    Dashboard,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    const data = this.params.list.data[this.params.resId].data
    let platform = 'idc'
    if (data.provider) {
      platform = findPlatform(data.provider.toLowerCase(), 'provider')
    }
    const detailTabs = [
      { label: '详情', key: 'cloudaccount-detail' },
      { label: '订阅', key: 'cloudprovider-list' },
      // { label: '资源统计', key: 'dashboard' }, // 暂时去掉
      { label: '操作日志', key: 'event-drawer' },
    ]
    if (platform === 'idc' || platform === 'private') {
      detailTabs.splice(1, 0, { label: '宿主机', key: 'host-list' })
    }
    return {
      data,
      detailTabs,
    }
  },
  computed: {
    getParams () {
      if (this.params.windowData.currentTab === 'cloudprovider-list') {
        return {
          detail: true,
          cloudaccount_id: this.params.resId,
        }
      } else if (this.params.windowData.currentTab === 'host-list') {
        return {
          detail: true,
          account: this.params.resId,
          baremetal: false,
        }
      }
      return null
    },
  },
}
</script>
