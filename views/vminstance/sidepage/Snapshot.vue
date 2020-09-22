<template>
  <div>
    <a-tabs :defaultActiveKey="currentComponent" @change="callback" :animated="false">
      <a-tab-pane v-for="obj in tabs" :key="obj.key" :tab="obj.label">
        <div class="mt-2">
          <keep-alive>
            <component v-if="obj.key === currentComponent" :is="currentComponent" :getParams="getParams" />
          </keep-alive>
        </div>
      </a-tab-pane>
    </a-tabs>
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
  methods: {
    callback (key) {
      this.currentComponent = key
    },
  },
}
</script>
