<template>
  <div>
    <page-header title="弹性伸缩组" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'ScalingGroup',
  components: {
    List,
  },
  data () {
    return {
      listId: 'ScalingGroupList',
    }
  },
}
</script>
