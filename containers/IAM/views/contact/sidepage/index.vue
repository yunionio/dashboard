<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.contact')"
    icon="res-contact"
    :res-name="detailData.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :id="listId" :data="detailData" :res-id="data.id" :onManager="onManager" />
  </base-side-page>
</template>

<script>
import * as R from 'ramda'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ContactDetail from './Detail'

export default {
  name: 'ContactSidePage',
  components: {
    Actions,
    ContactDetail,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('system.text_159'), key: 'contact-detail' },
        { label: this.$t('system.text_17'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForContactSidePage'
        default:
          return ''
      }
    },
  },
  methods: {
    parseDetail (detail) {
      const ret = {
        enabled: true,
        email: {
          enabled: false,
          verified: false,
          contact: '',
        },
        mobile: {
          enabled: false,
          verified: false,
          contact: '',
        },
      }
      if (!R.is(String, detail)) return ret
      const arr = JSON.parse(detail)
      arr.forEach(item => {
        ret[item.contact_type] = item
        if (!item.enabled) {
          ret.enabled = false
        }
      })
      return ret
    },
  },
}
</script>
