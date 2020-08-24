<template>
  <div>
    <a-popover trigger="click" :getPopupContainer="triggerNode => triggerNode.parentNode">
      <div class="trigger d-flex align-items-center justify-content-center">
        <span v-if="workOrderMenuTitleUsedText">{{$t('common_198')}}</span>
        <a-badge :count="statistics" :overflowCount="99" v-else>
          <icon type="navbar-process" style="font-size: 24px;" />
        </a-badge>
      </div>
      <template v-slot:content>
        <div class="work-order-wrap">
          <div class="work-order-header d-flex align-items-center">
            <div class="flex-fill title">{{$t('common_199')}}</div>
          </div>
          <div class="mt-2 text-color-help" style="font-size: 12px;"><a-icon type="user" /><span class="ml-2">{{$t('common_200')}}</span></div>
          <ul class="work-list">
            <li @click="goHistoricProcess">{{$t('common_201')}}<a>{{workflowStatistics['nr-historic-process-instance'] || 0}}</a>{{$t('common_202')}}</li>
            <li @click="goProcessTask">{{$t('common_203')}}<a>{{workflowStatistics['nr-process-task'] || 0}}</a>{{$t('common_202')}}</li>
          </ul>
          <template v-if="!isAdminMode && isShowWorkflow">
            <div class="mt-2 text-color-help" style="font-size: 12px;"><a-icon type="plus" /><span class="ml-2">{{$t('common_204')}}</span></div>
            <ul class="work-list">
              <li @click="joinProjectHandle" v-if="isProjectMode && projectEnabled">{{$t('common_205')}}{{$t('dictionary.project')}}</li>
              <li @click="customeServiceHandle" v-if="customerServiceEnabled">{{$t('common_206')}}</li>
              <li @click="applyProjectQuotaHandle" v-if="isProjectMode && projectQuotaEnabled">{{$t('common_207')}}{{$t('dictionary.project')}}{{$t('common_208')}}</li>
              <li @click="applyDomainQuotaHandle" v-if="isDomainMode && domainQuotaEnabled">{{$t('common_207')}}{{$t('dictionary.domain')}}{{$t('common_208')}}</li>
            </ul>
          </template>
        </div>
      </template>
    </a-popover>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import workflowMixin from '@/mixins/workflow'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { WORKFLOW_TYPES } from '@/constants/workflow'

export default {
  name: 'WorkOrderPopover',
  mixins: [workflowMixin, DialogMixin, WindowsMixin],
  props: {
    workOrderMenuTitleUsedText: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'isProjectMode']),
    statistics () {
      return (this.workflowStatistics['nr-historic-process-instance'] + this.workflowStatistics['nr-process-task']) || 0
    },
    projectEnabled () {
      return this.checkWorkflowEnabled(WORKFLOW_TYPES.APPLY_JOIN_PROJECT)
    },
    customerServiceEnabled () {
      return this.checkWorkflowEnabled(WORKFLOW_TYPES.CUSTOMER_SERVICE)
    },
    projectQuotaEnabled () {
      return this.checkWorkflowEnabled(WORKFLOW_TYPES.APPLY_PROJECT_QUOTA)
    },
    domainQuotaEnabled () {
      return this.checkWorkflowEnabled(WORKFLOW_TYPES.APPLY_DOMAIN_QUOTA)
    },
    isShowWorkflow () {
      return this.projectEnabled || this.customerServiceEnabled || this.projectQuotaEnabled || this.domainQuotaEnabled
    },
  },
  methods: {
    goHistoricProcess () {
      this.$router.push('/workflow')
    },
    goProcessTask () {
      this.$router.push({
        path: '/workflow',
        query: {
          type: 'approval-start',
        },
      })
    },
    joinProjectHandle () {
      this.createDialog('ApplyJoinProjectDialog', {})
    },
    customeServiceHandle () {
      this.createDialog('CustomeServiceDialog', {})
    },
    applyProjectQuotaHandle () {
      this.createDialog('ApplyProjectQuotaDialog', {})
    },
    applyDomainQuotaHandle () {
      this.createDialog('ApplyDomainQuotaDialog', {})
    },
  },
}
</script>

<style lang="less" scoped>
.trigger {
  height: 100%;
  // padding: 0 20px;
  cursor: pointer;
  text-decoration: none;
}
.work-order-wrap {
  width: 200px;
}
.work-order-header {
  margin: 0;
  color: #606266;
  font-size: 14px;
  padding: 10px 10px;
  border-bottom: 1px solid #f5f5f5;
}
.loading {
  padding: 15px;
}
.work-list {
  margin: 0;
  padding: 0;
  list-style: none;
  margin-top: 5px;
  > li {
    padding: 4px 10px;
    &:hover {
      background-color: #edf6ff;
      color: #1890ff;
      cursor: pointer;
    }
  }
}
</style>
