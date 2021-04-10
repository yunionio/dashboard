<template>
  <div>
    <page-header :title="$t('compute.text_95')" />
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
