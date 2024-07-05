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
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import AssociatedInstances from './AssociatedInstances'
import SecgroupDetail from './Detail'
import InDirection from './InDirection'
import OutDirection from './OutDirection'

export default {
  name: 'SecGroupSidePage',
  components: {
    SecgroupDetail,
    Actions,
    OutDirection,
    InDirection,
    AssociatedInstances,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    let detailTabs = [
      { label: this.$t('compute.text_238'), key: 'secgroup-detail' },
      { label: this.$t('compute.text_993'), key: 'in-direction' },
      { label: this.$t('compute.text_994'), key: 'out-direction' },
      { label: this.$t('compute.associated_instances'), key: 'associated-instances' },
      { label: this.$t('compute.text_240'), key: 'event-drawer' },
    ]
    if (this.params.hiddenSidepageTabs && this.params.hiddenSidepageTabs.includes('associated-instances')) {
      detailTabs = R.remove(R.findIndex(R.propEq('key', 'associated-instances'))(detailTabs), 1, detailTabs)
    }
    if (this.params.row && this.params.row.brand && this.params.row.brand.toLowerCase() === 'ucloud') {
      detailTabs = R.remove(R.findIndex(R.propEq('key', 'out-direction'))(detailTabs), 1, detailTabs)
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
          listId: 'LIST_Secgroup_Inlist',
        }
      } else if (this.params.windowData.currentTab === 'out-direction') {
        return {
          type: 'out',
          id: this.data.id,
          listId: 'LIST_Secgroup_Outlist',
        }
      } else if (this.params.windowData.currentTab === 'associated-instances') {
        return {
          secgroup_id: this.detailData.id,
          brand: this.detailData.brand,
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
