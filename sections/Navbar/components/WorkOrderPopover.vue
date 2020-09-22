<template>
  <div>
    <a-popover trigger="click" :getPopupContainer="triggerNode => triggerNode.parentNode">
      <div class="trigger d-flex align-items-center justify-content-center">
        <span v-if="workOrderMenuTitleUsedText">{{$t('navbar.button.work_order')}}</span>
        <a-tooltip :title="$t('navbar.button.work_order')" placement="right" v-else>
          <a-badge :count="statistics" :overflowCount="99">
            <icon type="navbar-process" style="font-size: 24px;" />
          </a-badge>
        </a-tooltip>
      </div>
      <template v-slot:content>
        <div class="work-order-wrap">
          <div class="work-order-header d-flex align-items-center">
            <div class="flex-fill title">{{$t('navbar.button.work_order')}}</div>
          </div>
          <div class="mt-2 text-color-help" style="font-size: 12px;"><a-icon type="user" /><span class="ml-2">{{$t('navbar.tips.pending_work_order')}}</span></div>
          <ul class="work-list">
            <i18n path="navbar.button.work_order_undone" tag="li" @click="goHistoricProcess">
              <template #num>
                <a>{{workflowStatistics['nr-historic-process-instance'] || 0}}</a>
              </template>
            </i18n>
            <i18n path="navbar.button.pending_work_order" tag="li" @click="goProcessTask">
              <template #num>
                <a>{{workflowStatistics['nr-process-task'] || 0}}</a>
              </template>
            </i18n>
          </ul>
          <template v-if="!isAdminMode && isShowWorkflow">
            <div class="mt-2 text-color-help" style="font-size: 12px;"><a-icon type="plus" /><span class="ml-2">{{$t('common_204')}}</span></div>
            <ul class="work-list">
              <li @click="joinProjectHandle" v-if="isProjectMode && projectEnabled">{{$t('navbar.button.join_project')}}</li>
              <li @click="customeServiceHandle" v-if="customerServiceEnabled">{{$t('navbar.button.work_order_support')}}</li>
              <li @click="applyProjectQuotaHandle" v-if="isProjectMode && projectQuotaEnabled">{{$t('navbar.button.work_order_apply_project_quota')}}</li>
              <li @click="applyDomainQuotaHandle" v-if="isDomainMode && domainQuotaEnabled">{{$t('navbar.button.work_order_apply_domain_quota')}}</li>
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
