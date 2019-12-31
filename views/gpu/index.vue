<template>
  <div>
    <page-header title="透传设备" />
    <page-body>
      <gpu-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import GpuList from './components/List'

export default {
  name: 'GPUIndex',
  components: {
    GpuList,
  },
  data () {
    return {
      listId: 'GpuList',
    }
  },
}
</script>
