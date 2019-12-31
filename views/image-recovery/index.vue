<template>
  <div>
    <page-header title="镜像回收站" />
    <page-body>
      <image-recovery-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import ImageRecoveryList from './components/List'

export default {
  name: 'ImageRecoveryIndex',
  components: {
    ImageRecoveryList,
  },
  data () {
    return {
      listId: 'ImageRecoveryList',
    }
  },
}
</script>
