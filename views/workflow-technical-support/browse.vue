<template>
  <div>
    <component :is="render" />
  </div>
</template>

<script>
import MeProcessBrowse from './me-process/browse'
import ApprovalStartBrowse from './approval-start/browse'
import ApprovedDoneBrowse from './approved-done/browse'
import AllProcessBrowse from './all-process/browse'

export default {
  name: 'WorkflowSupportMeProcessBrowseIndex',
  components: {
    MeProcessBrowse,
    ApprovalStartBrowse,
    ApprovedDoneBrowse,
    AllProcessBrowse,
  },
  data () {
    return {
      render: 'me-process-browse',
    }
  },
  created () {
    const { type } = this.$route.query
    this.render = `${type}-browse`
  },
}
</script>
