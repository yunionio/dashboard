<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('cloudenv.text_12')"
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
    <component :is="params.windowData.currentTab" :data="detailData" :cloudaccount="detailData" :on-manager="onManager" :res-id="data.id" :id="listId" resource="cloudaccounts" :cloudaccount-list-refresh="params.options.refresh" :getParams="getParams" />
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
import ExternalprojectList from '@Cloudenv/views/externalproject/components/List'
import SamluserList from '@Cloudenv/views/samluser/components/List'

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
    ExternalprojectList,
    SamluserList,
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
        { label: this.$t('cloudenv.text_237'), key: 'cloudaccount-detail' },
        { label: this.$t('cloudenv.text_318'), key: 'cloudprovider-list' },
        { label: this.$t('cloudenv.text_386'), key: 'externalproject-list' },
        { label: this.$t('cloudenv.text_319'), key: 'usage' },
        { label: this.$t('cloudenv.text_15'), key: 'event-drawer' },
      ]
      if (platform === 'idc' || platform === 'private') {
        detailTabs.splice(1, 0, { label: this.$t('cloudenv.text_101'), key: 'host-list' })
      }
      if (['Huawei', 'Aliyun', 'Azure', 'Google', 'Aws', 'Qcloud'].includes(data.provider)) {
        detailTabs.splice(detailTabs.length - 1, 0, { label: this.$t('dictionary.clouduser'), key: 'clouduser-list' })
        detailTabs.splice(detailTabs.length - 1, 0, { label: this.$t('dictionary.cloudgroup'), key: 'cloudgroup-list' })
      }
      if (['Huawei', 'Aws', 'Qcloud'].includes(data.provider)) {
        detailTabs.splice(detailTabs.length - 1, 0, { label: this.$t('cloudaccount.sidepage.tab.samluser'), key: 'samluser-list' })
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
      } else if (this.params.windowData.currentTab === 'clouduser-list') {
        return {
          cloudaccount: this.data.id,
        }
      } else if (this.params.windowData.currentTab === 'cloudgroup-list') {
        return {
          provider: this.data.data && this.data.data.provider,
        }
      } else if (this.params.windowData.currentTab === 'externalproject-list') {
        return () => {
          return {
            cloudaccount_id: this.data.id,
          }
        }
      } else if (this.params.windowData.currentTab === 'samluser-list') {
        return {
          cloudaccount: this.data.id,
        }
      }
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForCloudaccountSidePage'
        case 'cloudprovider-list':
          return 'CloudproviderListForCloudaccountSidePage'
        case 'externalproject-list':
          return 'ExternalprojectListForCloudaccountSidePage'
        case 'host-list':
          return 'HostListForCloudaccountSidePage'
        case 'clouduser-list':
          return 'ClouduserListForCloudaccountSidePage'
        case 'cloudgroup-list':
          return 'CloudgroupListForCloudaccountSidePage'
        case 'samluser-list':
          return 'SamluserListForCloudaccountSidePage'
        default:
          return ''
      }
    },
  },
  created () {
    if (R.isNil(R.find(R.propEq('key', this.params.windowData.currentTab))(this.detailTabs))) {
      this.handleTabChange(this.detailTabs[0].key)
    }
  },
}
</script>
