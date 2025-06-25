<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.notify-topic')"
    icon="res-notify-topic"
    :res-name="resName"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :id="listId" :res-id="data.id" :data="detailData" :onManager="onManager" :getParams="getParams" />
  </base-side-page>
</template>

<script>
import { mapGetters } from 'vuex'
import Subscriber from '@IAM/views/notify-subscriber/components/List'
import { NOTIFY_TOPIC_NAMES_MAP } from '@IAM/constants'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import TopicDetail from './Detail'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'NotifyTopicSidePage',
  components: {
    Subscriber,
    TopicDetail,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('system.text_159'), key: 'topic-detail' },
        { label: this.$t('system.notify.topic.receiver.management'), key: 'subscriber' },
        { label: this.$t('system.text_17'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode']),
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'subscriber':
          return 'Subscriber'
        case 'event-drawer':
          return 'EventListForNotifySidePage'
        default:
          return ''
      }
    },
    resName () {
      return NOTIFY_TOPIC_NAMES_MAP[this.detailData.name] || this.detailData.name || '-'
    },
    getParams () {
      return null
    },
  },
  created () {
    if (this.params.tab) this.handleTabChange(this.params.tab)
  },
}
</script>

<style scoped>

</style>
