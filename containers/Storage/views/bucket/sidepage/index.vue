<template>
  <base-side-page
   @cancel="cancelSidePage"
    :title="$t('storage.text_18')"
    icon="res-bucket"
    :res-name="detailData.name"
    :tabs="detailTabs"
    :current-tab="params.windowData.currentTab"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component :columns="columns" :is="params.windowData.currentTab" :data="detailData" :on-manager="onManager" :refresh="refresh" :getParams="getParams" :params="getParams" :res-id="getParams.storage" :id="listId" />
  </base-side-page>
</template>

<script>

import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import Detail from './Detail'
import Objects from './Objects'
import Monitor from './Monitor'
import Rules from './CrossDomainRules'
import Policies from './Policies'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'BucketStorageSidePage',
  components: {
    Actions,
    Detail,
    Objects,
    Monitor,
    Rules,
    Policies,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('storage.text_81'), key: 'detail' },
        { label: this.$t('storage.text_169'), key: 'objects' },
        { label: this.$t('storage.text_211'), key: 'rules' },
        { label: this.$t('storage.text_259'), key: 'Policies' },
        { label: this.$t('storage.text_170'), key: 'monitor' },
        { label: this.$t('storage.text_85'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return {
        storage: this.data.id,
        details: true,
      }
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForBucketStorageSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
