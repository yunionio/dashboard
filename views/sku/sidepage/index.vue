<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('compute.text_109')"
    icon="res-sku"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component
      :is="params.windowData.currentTab"
      :res-id="data.id"
      :id="listId"
      :data="detailData"
      :on-manager="onManager"
      :getParams="getParams"
      :cloudEnv="cloudEnvData"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import _ from 'lodash'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import SkuDetail from './Detail'
import VminstanceList from '@Compute/views/vminstance/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'SkuSidePage',
  components: {
    SkuDetail,
    VminstanceList,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('compute.text_238'), key: 'sku-detail' },
        { label: this.$t('compute.text_1023'), key: 'vminstance-list' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ],
      cloudEnvData: _.get(this.params, 'options.cloudEnv') || this.cloudEnv,
    }
  },
  computed: {
    getParams () {
      return {
        instance_type: this.detailData.name,
        cloudregion_id: this.detailData.cloudregion_id,
        zone_id: this.detailData.zone_id,
      }
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForSkuSidePage'
        case 'vminstance-list':
          return 'VminstanceListForSkuSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
