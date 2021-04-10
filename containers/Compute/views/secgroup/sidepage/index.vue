<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('compute.text_105')"
    icon="res-secgroup"
    :res-name="detailData.name"
    :actions="params.actions"
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
      :data="detailData"
      :getParams="getParams"
      res-type="secgroup"
      :on-manager="onManager"
      :columns="columns"
      :hidden-columns="hiddenColumns"
      @refresh="refresh"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import * as R from 'ramda'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import VminstanceList from './Server'
import SecgroupDetail from './Detail'
import InDirection from './InDirection'
import OutDirection from './OutDirection'
import CacheList from './Cache'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'SecGroupSidePage',
  components: {
    SecgroupDetail,
    Actions,
    OutDirection,
    InDirection,
    CacheList,
    VminstanceList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    let detailTabs = [
      { label: this.$t('compute.text_238'), key: 'secgroup-detail' },
      { label: this.$t('compute.text_993'), key: 'in-direction' },
      { label: this.$t('compute.text_994'), key: 'out-direction' },
      { label: this.$t('compute.text_1023'), key: 'vminstance-list' },
      { label: this.$t('compute.text_692'), key: 'cache-list' },
      { label: this.$t('compute.text_240'), key: 'event-drawer' },
    ]
    if (this.params.hiddenSidepageTabs && this.params.hiddenSidepageTabs.includes('vminstance-list')) {
      detailTabs = R.remove(R.findIndex(R.propEq('key', 'vminstance-list'))(detailTabs), 1, detailTabs)
    }
    return {
      detailTabs,
    }
  },
  computed: {
    getParams () {
      if (this.params.windowData.currentTab === 'in-direction') {
        return {
          type: 'in',
          id: this.data.id,
        }
      } else if (this.params.windowData.currentTab === 'out-direction') {
        return {
          type: 'out',
          id: this.data.id,
        }
      } else if (this.params.windowData.currentTab === 'cache-list') {
        return {
          id: this.data.id,
        }
      } else if (this.params.windowData.currentTab === 'vminstance-list') {
        return {
          secgroup: this.detailData.id,
        }
      }
      return null
    },
    hiddenActions () {
      return this.params.hiddenActions || []
    },
    hiddenColumns () {
      return this.params.hiddenColumns || []
    },
  },
  created () {
    if (this.params.tab) this.handleTabChange(this.params.tab)
  },
}
</script>
