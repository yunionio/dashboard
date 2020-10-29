<template>
  <div>
    <a-tabs :defaultActiveKey="currentComponent" @change="callback" :animated="false">
      <template v-for="obj of tabs">
        <a-tab-pane :tab="obj.label" :key="obj.key" />
      </template>
    </a-tabs>
    <div class="mt-2">
      <keep-alive>
        <component :is="currentComponent" :getParams="getParams" />
      </keep-alive>
    </div>
  </div>
</template>

<script>
import DiskSnapshotList from '@Compute/views/snapshot/components/List'
import InstanceSnapshotList from '@Compute/views/snapshot-instance/components/List'

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
      tabs: [
        {
          key: 'DiskSnapshotList',
          label: this.$t('compute.text_101'),
        },
        {
          key: 'InstanceSnapshotList',
          label: this.$t('compute.text_102'),
        },
      ],
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
  },
  methods: {
    callback (key) {
      this.currentComponent = key
    },
  },
}
</script>
