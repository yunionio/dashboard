<template>
  <div>
    <a-tabs default-active-key="res-sync" @change="handleTabChange">
      <a-tab-pane v-for="item in tabs" :key="item.key" :tab="item.label" />
    </a-tabs>
    <div class="mt-2">
      <keep-alive>
        <component
          :is="currentTab"
          :id="id"
          :resId="resId"
          :data="data"
          :getParams="getParams" />
      </keep-alive>
    </div>
  </div>

</template>

<script>
import ResSync from './ResSync'
import BillSync from './BillSync'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { hasMeterService } from '@/utils/auth'

export default {
  name: 'ScheduledtasksListForCloudaccountSidepage',
  components: {
    ResSync,
    BillSync,
  },
  mixins: [WindowsMixin, ListMixin],
  props: {
    id: String,
    resId: String,
    data: Object,
    getParams: [Function, Object],
  },
  data () {
    return {
      currentTab: 'res-sync',
    }
  },
  computed: {
    tabs () {
      const tabs = [
        { key: 'res-sync', label: this.$t('cloudenv.res_sync') },
      ]
      if (hasMeterService()) {
        tabs.push({ key: 'bill-sync', label: this.$t('cloudenv.bill_sync') })
      }
      return tabs
    },
  },
  methods: {
    handleTabChange (tab) {
      this.currentTab = tab
    },
  },
}
</script>
