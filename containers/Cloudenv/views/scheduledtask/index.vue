<template>
  <div>
    <page-header :title="$t('cloudenv.text_431')" />
    <a-alert :message="$t('cloudenv.scheduled_task_desc')" type="info" class="mt-2" />
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
