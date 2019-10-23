<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="云账号"
    icon="onecloud"
    :res-name="data.name"
    :actions="params.actions"
    :tabs="detailTabs"
    v-model="detailComponent">
    <template v-slot:actions>
      <actions :options="params.singleActions" :row="data" :buttonMode="false" />
    </template>
    <component :is="detailComponent" :data="data" :res-id="params.resId" :list="params.list" :getParams="getParams" />
  </base-side-page>
</template>

<script>
import CloudproviderList from '@Cloudenv/views/cloudprovider/components/List'
import HostList from '@Compute/views/host/components/List'
import CloudaccountDetail from './Detail'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'CloudaccountSidePage',
  components: {
    Actions,
    CloudaccountDetail,
    CloudproviderList,
    HostList,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailComponent: 'cloudaccount-detail',
      detailTabs: [
        { label: '详情', key: 'cloudaccount-detail' },
        { label: '订阅', key: 'cloudprovider-list' },
        { label: '宿主机', key: 'host-list' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.detailComponent === 'cloudprovider-list') {
        return () => {
          return {
            detail: true,
            cloudaccount_id: this.params.resId,
          }
        }
      } else if (this.detailComponent === 'host-list') {
        return () => {
          return {
            detail: true,
            account: this.params.resId,
            baremetal: false,
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
