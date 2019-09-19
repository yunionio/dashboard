<template>
  <div class="diskconfig">
    <disk-list />
    <diskconfig-dialog
      :visible.sync="visible"
      :image-msg="imageMsg"
      :disk-specs="diskSpecs" />
    <a-button type="primary" icon="plus" @click="showDiskconfig">新增磁盘</a-button>
  </div>
</template>

<script>
import DiskList from './DiskList'
import DiskconfigDialog from './DiskconfigDialog'

export default {
  name: 'Diskconfig',
  components: {
    DiskList,
    DiskconfigDialog,
  },
  props: {
    value: {
      type: Array,
      required: true,
    },
    imageMsg: {
      type: Object,
      required: true,
    },
    diskSpecs: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      visible: false,
    }
  },
  methods: {
    showDiskconfig () {
      this.visible = true
    },
  },
}
</script>
