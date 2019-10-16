<template>
  <div>
    <page-header title="调度标签" />
    <page-body>
      <schedtag-list />
    </page-body>
  </div>
</template>

<script>
import SchedtagList from './components/SchedtagList'

export default {
  name: 'Schedtag',
  components: {
    SchedtagList,
  },
}
</script>
