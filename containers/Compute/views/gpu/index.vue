<template>
  <div>
    <page-header :title="$t('compute.text_113')" />
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
