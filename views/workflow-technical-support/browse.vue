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
    const { type, id } = this.$route.query
    this.render = `${type}-browse`
    type === 'approval-start' && this.updateProcessState(id)
  },
  methods: {
    updateProcessState (id) {
      new this.$Manager('process-instances', 'v1').update({
        id: `${id}/process_state`,
        data: {
          customized_state: 'IN_PROCESS',
        },
      }).then((res) => {
        this.reply = ''
        this.replyData = res.data.chat_list || []
      })
    },
  },
}
</script>
