<template>
  <div>
    <page-header title="任务(Job)" />
    <page-body>
      <job-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import JobList from './components/List'

export default {
  name: 'K8sJobIndex',
  components: {
    JobList,
  },
  data () {
    return {
      listId: 'K8sJobList',
    }
  },
}
</script>
