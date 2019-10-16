<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="云账号"
    icon="onecloud"
    :res-name="data.name"
    :actions="params.actions"
    :tabs="detailTabs"
    v-model="detailComponent">
    <template v-slot:actions>
      <actions :options="params.singleActions" :row="data" :buttonMode="false" />
    </template>
    <component :is="detailComponent" :data="data" :list="params.list" />
  </base-side-page>
</template>

<script>
import CloudaccountDetail from '../Detail'

import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'CloudaccountSidePage',
  components: {
    Actions,
    CloudaccountDetail,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailComponent: 'cloudaccount-detail',
      detailTabs: [
        { label: '详情', key: 'cloudaccount-detail' },
      ],
    }
  },
  computed: {
    data () {
      return this.params.list.data[this.params.resId].data
    },
  },
}
</script>
