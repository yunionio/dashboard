<template>
  <div>
    <page-header :title="$t('k8s.vc_priority_class')" />
    <page-body>
      <priorityclass-list :id="listId" />
    </page-body>
  </div>
</template>

<script>
import PriorityclassList from './components/List'

export default {
  name: 'K8sPriorityclassIndex',
  components: {
    PriorityclassList,
  },
  data () {
    return {
      listId: 'K8sPriorityclassList',
    }
  },
}
</script>
