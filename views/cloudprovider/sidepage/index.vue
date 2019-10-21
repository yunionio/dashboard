<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="订阅"
    icon="onecloud"
    :res-name="data.name"
    :actions="params.actions"
    :tabs="detailTabs"
    v-model="detailComponent">
    <template v-slot:actions>
      <actions :options="params.singleActions" :row="data" :buttonMode="false" />
    </template>
    <component :is="detailComponent" :data="data" :list="params.list" :cloudprovider-id="params.resId" :getParams="getParams" />
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
      detailComponent: 'cloudaccount-detail',
      detailTabs: [
        { label: '详情', key: 'cloudaccount-detail' },
        { label: '区域', key: 'cloudproviderregion-list' },
        { label: '项目', key: 'externalproject-list' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.detailComponent === 'cloudproviderregion-list') {
        return () => {
          return {
            cloudprovider_id: this.params.resId,
            details: true,
          }
        }
      } else if (this.detailComponent === 'externalproject-list') {
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
