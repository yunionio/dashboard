/**
 * author: houjiazong <houjiazong@gmail.com>
 * date: 2019/11/21
 * Workflow Mixin
 */

import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['workflow']),
    workflowStatistics () {
      return this.workflow.statistics
    },
    workflowEnabledKeys () {
      return this.workflow.enabledKeys
    },
  },
  methods: {
    checkWorkflowEnabled (key) {
      return this.workflowEnabledKeys.includes(key)
    },
  },
}
