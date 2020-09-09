<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('network.text_720')"
    icon="res-dns"
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
      :res-id="detailData.id"
      :data="detailData"
      :getParams="getParams"
      :on-manager="onManager"
      @side-page-trigger-handle="sidePageTriggerHandle"
      @init-side-page-tab="initSidePageTab"
      @refresh="refresh"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import DnsZoneDetail from './Detail'
import DnsAssociateVpcList from './DnsAssociateVpcList'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import DnsRecordsetListForDnsZoneSidepage from '@Network/views/dns-recordset/components/List'
import DnsZonecacheListForDnsZoneSidepage from '@Network/views/dns-zonecache/components/List'

export default {
  name: 'DnsZoneSidePage',
  components: {
    DnsZoneDetail,
    Actions,
    DnsRecordsetListForDnsZoneSidepage,
    DnsAssociateVpcList,
    DnsZonecacheListForDnsZoneSidepage,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('network.text_67'), key: 'dns-zone-detail' },
        { label: this.$t('common_663'), key: 'dns-recordset-list-for-dns-zone-sidepage' },
        { label: this.$t('network.text_719'), key: 'dns-associate-vpc-list' },
        { label: this.$t('network.text_316'), key: 'dns-zonecache-list-for-dns-zone-sidepage' },
        { label: this.$t('network.text_150'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.params.windowData.currentTab === 'dns-recordset-list-for-dns-zone-sidepage') {
        return {
          detail: true,
          dns_zone_id: this.detailData.id,
        }
      } else if (this.params.windowData.currentTab === 'dns-associate-vpc-list') {
        return {
          detail: true,
          dns_zone_id: this.detailData.id,
        }
      } else if (this.params.windowData.currentTab === 'dns-zonecache-list-for-dns-zone-sidepage') {
        return {
          detail: true,
          dns_zone_id: this.detailData.id,
        }
      }
      return null
    },
  },
}
</script>
