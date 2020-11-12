<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('cloudenv.text_14')"
    icon="res-proxysetting"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :loaded="loaded"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
     <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :res-id="data.id" :id="listId" :data="detailData" :on-manager="onManager" :getParams="getParams" />
  </base-side-page>
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import detail from './Detail'
import CloudaccountList from '@Cloudenv/views/cloudaccount/components/List'
import Actions from '@/components/PageList/Actions'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ProxysettingSidePage',
  components: {
    Actions,
    detail,
    CloudaccountList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('cloudenv.text_237'), key: 'detail' },
        { label: this.$t('cloudenv.text_12'), key: 'cloudaccount-list' },
        { label: this.$t('cloudenv.text_15'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return {
        proxy_setting: this.detailData.id,
      }
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForProxysettingSidePage'
        case 'cloudaccount-list':
          return 'CloudaccountListForProxysettingSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
