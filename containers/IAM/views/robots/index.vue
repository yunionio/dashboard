<template>
  <div>
    <page-header :title="$t('system.robot_manage')" />
    <page-body>
      <list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'RobotIndex',
  components: {
    List,
  },
  data () {
    return {
      listId: 'RobotList',
    }
  },
}
</script>
