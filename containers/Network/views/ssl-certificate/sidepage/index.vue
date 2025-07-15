<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('network.ssl_certificate')"
    icon="res-ssl-certificate"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :loaded="loaded"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions
        :options="singleActions"
        :row="detailData"
        :before-show-menu="beforeShowMenu"
        button-type="link"
        button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :res-id="data.id" :id="listId" :data="detailData" :on-manager="onManager" taskResource="compute-tasks" @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import Actions from '@/components/PageList/Actions'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'SslCertificateSidePage',
  components: {
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('cloudenv.text_15'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForWafInstancesSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
