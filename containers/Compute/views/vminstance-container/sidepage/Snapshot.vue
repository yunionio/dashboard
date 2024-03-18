<template>
  <div>
    <a-tabs :defaultActiveKey="currentComponent" @change="callback" :animated="false">
      <template v-for="obj of tabs">
        <a-tab-pane :tab="obj.label" :key="obj.key" />
      </template>
    </a-tabs>
    <div class="mt-2">
      <keep-alive>
        <component :is="currentComponent" :getParams="getParams" :id="id" />
      </keep-alive>
    </div>
  </div>
</template>

<script>
import DiskSnapshotList from '@Compute/views/snapshot/components/List'
import InstanceSnapshotList from '@Compute/views/snapshot-instance/components/List'
import { hasSetupKey } from '@/utils/auth'
import { isScopedPolicyMenuHidden } from '@/utils/scopedPolicy'

export default {
  name: 'SnapshotIndex',
  components: {
    DiskSnapshotList,
    InstanceSnapshotList,
  },
  props: {
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    return {
      currentComponent: 'DiskSnapshotList',
    }
  },
  computed: {
    id () {
      switch (this.currentComponent) {
        case 'InstanceSnapshotList':
          return 'InstanceSnapshotListForVminstanceSidepage'
        default:
          return 'DiskSnapshotListForVminstanceSidepage'
      }
    },
    tabs () {
      const ret = []
      if (!isScopedPolicyMenuHidden('sub_hidden_menus.disk_snapshot') && hasSetupKey(['onestack', 'private', 'public'])) {
        ret.push({
          key: 'DiskSnapshotList',
          label: this.$t('compute.text_101'),
        })
      }
      if (!isScopedPolicyMenuHidden('sub_hidden_menus.instance_snapshot') && hasSetupKey(['onestack', 'vmware'])) {
        ret.push({
          key: 'InstanceSnapshotList',
          label: this.$t('compute.text_102'),
        })
      }
      return ret
    },
  },
  methods: {
    callback (key) {
      this.currentComponent = key
    },
  },
}
</script>
