<template>
  <div>
    <page-header :title="$t('k8s.text_242')" />
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
