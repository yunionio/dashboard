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
    <a-alert :message="$t('cloudenv.clouduser_desc')" class="mb-2" v-if="params.windowData.currentTab === 'clouduser-list'" />
    <component :is="params.windowData.currentTab" :data="detailData" :cloudaccount="detailData" :on-manager="onManager" :res-id="data.id" resource="cloudaccounts" :cloudaccount-list-refresh="params.options.refresh" :getParams="getParams" />
  </base-side-page>
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import CloudaccountDetail from './Detail'
import CloudproviderList from '@Cloudenv/views/cloudprovider/components/List'
import HostList from '@Compute/views/host/components/List'
import Usage from '@Cloudenv/sections/UsageSidepage'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import { findPlatform } from '@/utils/common/hypervisor'
import CloudgroupList from '@Cloudenv/views/cloudgroup/components/List'
import ClouduserList from '@Cloudenv/views/clouduser/components/List'

export default {
  name: 'CloudaccountSidePage',
  components: {
    Actions,
    CloudaccountDetail,
    CloudproviderList,
    HostList,
    Usage,
    ClouduserList,
    CloudgroupList,
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
      // if ((this.$store.getters.capability.cloud_id_brands || []).includes(data.provider)) {
      //   detailTabs.splice(detailTabs.length - 1, 0, { label: this.$t('dictionary.clouduser'), key: 'clouduser-list' })
      //   detailTabs.splice(detailTabs.length - 1, 0, { label: this.$t('dictionary.cloudgroup'), key: 'cloudgroup-list' })
      // }
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
      } else if (this.params.windowData.currentTab === 'clouduser-list') {
        return {
          cloudaccount: this.data.id,
        }
      } else if (this.params.windowData.currentTab === 'cloudgroup-list') {
        return {
          provider: this.data.data && this.data.data.provider,
        }
      }
      return null
    },
  },
  created () {
    if (R.isNil(R.find(R.propEq('key', this.params.windowData.currentTab))(this.detailTabs))) {
      this.handleTabChange(this.detailTabs[0].key)
    }
  },
}
</script>
