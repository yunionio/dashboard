<template>
  <div>
    <page-header title="定时任务(CronJob)" />
    <page-body>
      <cron-job-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import CronJobList from './components/List'

export default {
  name: 'K8sCronJobIndex',
  components: {
    CronJobList,
  },
  data () {
    return {
      listId: 'K8sCronJobList',
    }
  },
}
</script>
