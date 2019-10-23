<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="调度标签"
    icon="onecloud"
    :res-name="data.name"
    :actions="params.actions"
    :tabs="detailTabs"
    v-model="detailComponent">
    <template v-slot:actions>
      <actions :options="params.singleActions" :row="data" :buttonMode="false" />
    </template>
    <component :is="detailComponent" :data="data" :res-id="params.resId" :list="params.list" :getParams="getParams" />
  </base-side-page>
</template>

<script>
import HostList from '@Compute/views/host/components/List'
import PhysicalmachineList from '@Compute/views/physicalmachine/components/List'
import SchedtagDetail from './Detail'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'SchedtagSidePage',
  components: {
    Actions,
    SchedtagDetail,
    HostList,
    PhysicalmachineList,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailComponent: 'schedtag-detail',
      detailTabs: [
        { label: '详情', key: 'schedtag-detail' },
        { label: '物理机', key: 'physicalmachine-list' },
        { label: '宿主机', key: 'host-list' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.detailComponent === 'physicalmachine-list') {
        return {
          details: true,
          schedtag: this.params.resId,
          baremetal: true,
        }
      } else if (this.detailComponent === 'host-list') {
        return {
          detail: true,
          schedtag: this.params.resId,
          baremetal: false,
        }
      }
      return null
    },
    data () {
      return this.params.list.data[this.params.resId].data
    },
  },
}
</script>
