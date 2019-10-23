<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="区域"
    icon="onecloud"
    :res-name="data.name"
    :tabs="detailTabs"
    v-model="detailComponent">
    <component :is="detailComponent" :res-id="params.resId" :data="data" :list="params.list" :getParams="getParams" />
  </base-side-page>
</template>

<script>
import ZoneList from '@Cloudenv/views/zone/components/List'
import CloudregionDetail from './Detail'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CloudregionSidePage',
  components: {
    CloudregionDetail,
    ZoneList,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailComponent: 'cloudregion-detail',
      detailTabs: [
        { label: '详情', key: 'cloudregion-detail' },
        { label: '可用区', key: 'zone-list' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.detailComponent === 'zone-list') {
        return {
          details: true,
          with_meta: true,
          cloud_env: 'private_or_onpremise',
          cloudregion_id: this.params.resId,
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
