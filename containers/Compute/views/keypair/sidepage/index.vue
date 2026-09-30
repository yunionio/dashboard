<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('compute.text_108')"
    icon="res-keypair"
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
      :data="detailData"
      :res-id="id"
      :id="listId"
      :on-manager="onManager"
      :getParams="getParams"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import KeyPairDetail from './Detail'
import AssociatedInstances from './AssociatedInstances'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'KeyPairSidePage',
  components: {
    Actions,
    KeyPairDetail,
    AssociatedInstances,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('compute.text_238'), key: 'key-pair-detail' },
        { label: this.$t('compute.associated_instances'), key: 'associated-instances' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return {
        keypair_id: this.id,
      }
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForKeyPairSidePage'
        case 'associated-instances':
          return 'AssociatedInstancesForKeyPairSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
