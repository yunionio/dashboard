<template>
  <div>
    <a-tabs default-active-key="account-sync-task" @change="handleTabChange">
      <a-tab-pane v-for="item in tabs" :key="item.key" :tab="item.label" />
    </a-tabs>
    <div class="mt-2">
      <keep-alive>
        <component
          :is="currentTab"
          :id="id"
          :resId="resId"
          :data="data"
          :getParams="syncTaskGetParams"
          :accountData="data" />
      </keep-alive>
    </div>
  </div>

</template>

<script>
import BillTask from '@Cloudenv/views/billtasks/components/List'
import AccountSyncTask from '@Cloudenv/views/cloudaccountsynctasks/components/List'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { hasMeterService } from '@/utils/auth'
import ResSync from './ResSync'

export default {
  name: 'ScheduledtasksListForCloudaccountSidepage',
  components: {
    ResSync,
    BillTask,
    AccountSyncTask,
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
      currentTab: 'account-sync-task',
    }
  },
  computed: {
    tabs () {
      const tabs = [
        { key: 'account-sync-task', label: this.$t('cloudenv.account_sync_tasks') },
        { key: 'res-sync', label: this.$t('cloudenv.res_sync') },
      ]
      if (hasMeterService()) {
        tabs.push({ key: 'bill-task', label: this.$t('cloudenv.bill_tasks') })
      }
      return tabs
    },
    syncTaskGetParams () {
      if (this.currentTab === 'account-sync-task') {
        return {
          cloudaccount_id: this.resId || (this.data && this.data.id),
          account_level: true,
        }
      }
      return this.getParams
    },
  },
  methods: {
    handleTabChange (tab) {
      this.currentTab = tab
    },
  },
}
</script>
