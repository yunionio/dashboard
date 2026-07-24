<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('compute.title.ipset')"
    icon="res-secgroup"
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
      :data="detailData"
      :res-id="detailData.id"
      :id="listId"
      :on-manager="onManager"
      :columns="columns"
      :get-params="getParams"
      @refresh="refresh"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import IpSetDetail from './Detail'
import SecgroupListForIpsetSidepage from './Secgroup'

export default {
  name: 'IpSetSidePage',
  components: {
    Actions,
    IpSetDetail,
    SecgroupListForIpsetSidepage,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('compute.text_238'), key: 'ip-set-detail' },
        { label: this.$t('compute.text_105'), key: 'secgroup-list-for-ipset-sidepage' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForIpSetSidePage'
        case 'secgroup-list-for-ipset-sidepage':
          return 'SecgroupListForIpsetSidepage'
        default:
          return ''
      }
    },
    getParams () {
      return {
        ip_set_id: this.detailData.id,
      }
    },
  },
}
</script>
