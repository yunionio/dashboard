/**
 * author: houjiazong <houjiazong@gmail.com>
 * date: 2019/11/21
 * Workflow Mixin
 */

import { mapGetters } from 'vuex'
import { WORKFLOW_TYPES } from '@/constants/workflow'
import { getWorkflowParamterParams } from '@/utils/utils'

export default {
  data () {
    return {
      WORKFLOW_TYPES: { ...WORKFLOW_TYPES },
    }
  },
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
    async createWorkflow (variables) {
      if (!this.$appConfig.isPrivate) return Promise.reject(new Error('no workflow'))
      try {
        let params = variables
        if (variables.paramter && variables.length > 4000) {
          const paramterParams = getWorkflowParamterParams(variables.paramter)
          params = { ...params, ...paramterParams }
        }
        const response = new this.$Manager('process-instances', 'v1').create({
          data: {
            variables: params,
          },
        })
        this.$store.dispatch('app/fetchWorkflowStatistics')
        return response
      } catch (error) {
        return error
      }
    },
    async updateWorkflow (variables, workflow) {
      if (!this.$appConfig.isPrivate) return Promise.reject(new Error('no workflow'))
      try {
        let params = variables
        if (variables.paramter && variables.length > 4000) {
          const paramterParams = getWorkflowParamterParams(variables.paramter)
          params = { ...params, ...paramterParams }
        }
        const response = new this.$Manager('historic-process-instances', 'v1')
          .update({ id: `${workflow}/variables`, data: { variables: params } })
          .then(() => {
            this.$router.push('/workflow')
          })
          .catch((error) => {
            throw error
          })
        this.$store.dispatch('app/fetchWorkflowStatistics')
        return response
      } catch (error) {
        return error
      }
    },
  },
}
