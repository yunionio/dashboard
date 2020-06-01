<template>
  <div>
    <page-header :title="$t('dictionary.instancegroup')" />
    <page-body>
      <instance-group-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import InstanceGroupList from './components/List'

export default {
  name: 'InstanceGroupIndex',
  components: {
    InstanceGroupList,
  },
  data () {
    return {
      listId: 'InstanceGroupList',
    }
  },
}
</script>
