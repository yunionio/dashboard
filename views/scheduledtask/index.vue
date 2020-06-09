<template>
  <div>
    <page-header title="定时任务" />
    <page-body>
      <scheduledtask-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import ScheduledtaskList from './components/List'

export default {
  name: 'Scheduledtasks',
  components: {
    ScheduledtaskList,
  },
  data () {
    return {
      listId: 'ScheduledtaskList',
    }
  },
}
</script>
