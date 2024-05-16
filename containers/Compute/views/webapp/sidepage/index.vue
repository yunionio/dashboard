<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('compute.webapp')"
    icon="res-webapp"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions
        :options="singleActions"
        :row="detailData"
        button-type="link"
        button-size="small" />
    </template>
    <component
      :is="params.windowData.currentTab"
      :res-id="data.id"
      :id="listId"
      :data="detailData"
      :getParams="getParams"
      :on-manager="onManager"
      :columns="columns" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import Detail from './Detail'
import EnvironmentsList from './EnvironmentsList'
import DomainList from './DomainList'
import CertificateList from './CertificateList'
import BackupList from './BackupList'

export default {
  name: 'WebAppSidePage',
  components: {
    Detail,
    EnvironmentsList,
    Actions,
    DomainList,
    CertificateList,
    BackupList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('compute.text_238'), key: 'detail' },
        { label: this.$t('compute.webapp.env'), key: 'environments-list' },
        { label: this.$t('network.custom_domain'), key: 'domain-list' },
        { label: this.$t('network.text_143'), key: 'certificate-list' },
        { label: this.$t('common.backup'), key: 'backup-list' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForNotifySidePage'
        case 'environments-list':
          return 'EnvironmentsListForWebAppSidepage'
        default:
          return ''
      }
    },
    hiddenColumns () {
      return this.params.hiddenColumns || []
    },
  },
}
</script>
