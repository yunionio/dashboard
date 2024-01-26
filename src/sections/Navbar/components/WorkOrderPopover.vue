<template>
  <div>
    <a-popover trigger="click" :getPopupContainer="triggerNode => triggerNode.parentNode">
      <div class="trigger d-flex align-items-center justify-content-center">
        <span v-if="workOrderMenuTitleUsedText">{{$t('navbar.button.work_order')}}</span>
        <a-tooltip :title="$t('navbar.button.work_order')" placement="right" v-else>
          <a-badge :count="statistics" :overflowCount="99">
            <icon type="navbar-process" style="font-size: 22px;" />
          </a-badge>
        </a-tooltip>
      </div>
      <template v-slot:content>
        <div class="work-order-wrap">
          <div class="work-order-header d-flex align-items-center">
            <div class="flex-fill title" style="margin-right:5px;">{{$t('navbar.button.work_order')}}</div>
            <div class="flex-fill">
              <template v-if="companyInfo.hotline">
                <a-tooltip :title="$t('navbar.text.hotline')">
                <a-button type="dashed" shape="round" icon="phone" @click="copyHotline">{{ companyInfo.hotline }}</a-button>
                </a-tooltip>
              </template>
            </div>
          </div>
          <!-- 技术支持 -->
          <template v-if="customerServiceEnabled">
            <div class="mt-2 text-color-help" style="font-size: 12px;"><a-icon type="user" /><span class="ml-2">{{$t('common.text00036')}}</span></div>
            <ul class="work-list">
              <i18n path="navbar.button.work_order_undone" tag="li" @click="goHistoricProcessToSupport">
                <template #num>
                  <a>{{workflowStatistics['nr-historic-process-instance-cus'] || 0}}</a>
                </template>
              </i18n>
              <i18n path="navbar.button.pending_work_order-tech" tag="li" @click="goProcessTaskToSupport">
                <template #num>
                  <a>{{workflowStatistics['nr-process-task-cus'] || 0}}</a>
                </template>
              </i18n>
            </ul>
          </template>
          <!-- 待处理工单 -->
          <template v-if="isShowWorkflow">
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
          </template>
          <template v-if="isShowWorkflow && isShowAddWorkflow">
            <div class="mt-2 text-color-help" style="font-size: 12px;"><a-icon type="plus" /><span class="ml-2">{{$t('common_204')}}</span></div>
            <ul class="work-list">
              <li @click="joinProjectHandle" v-if="isProjectMode && projectEnabled">{{$t('navbar.button.join_project')}}</li>
              <li @click="customeServiceHandle" v-if="customerServiceEnabled">{{$t('navbar.button.work_order_support')}}</li>
              <li @click="applyProjectQuotaHandle" v-if="isProjectMode && projectQuotaEnabled">{{$t('navbar.button.work_order_apply_project_quota')}}</li>
              <li @click="applyDomainQuotaHandle" v-if="isDomainMode && domainQuotaEnabled">{{$t('navbar.button.work_order_apply_domain_quota')}}</li>
              <li @click="applyInternalResourceHandle" v-if="internalResourceEnabled">{{$t('navbar.button.work_order_apply_internal_resource')}}</li>
            </ul>
          </template>
        </div>
      </template>
    </a-popover>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
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
    ...mapState('app', {
      companyInfo: state => state.companyInfo,
    }),
    statistics () {
      const instance_num = this.workflowStatistics['nr-historic-process-instance']
      const task_num = this.workflowStatistics['nr-process-task']
      const instance_cus_num = this.workflowStatistics['nr-historic-process-instance-cus']
      const task_cus_num = this.workflowStatistics['nr-process-task-cus']

      if (this.customerServiceEnabled && this.isShowWorkflow) {
        return (instance_num + task_num + instance_cus_num + task_cus_num) || 0
      } else if (this.customerServiceEnabled) {
        return (instance_cus_num + task_cus_num) || 0
      } else if (this.isShowWorkflow) {
        return (instance_num + task_num) || 0
      }
      return 0
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
      if (this.workflowEnabledKeys?.length === 0) return false
      return this.workflowEnabledKeys.some(v => v !== WORKFLOW_TYPES.CUSTOMER_SERVICE)
    },
    internalResourceEnabled () {
      return this.checkWorkflowEnabled(WORKFLOW_TYPES.APPLY_INTERNAL_RESOURCE)
    },
    isShowAddWorkflow () {
      return (this.isProjectMode && (this.projectEnabled || this.projectQuotaEnabled)) ||
      this.customerServiceEnabled || (this.isDomainMode && this.domainQuotaEnabled) ||
      this.internalResourceEnabled
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
    goHistoricProcessToSupport () {
      this.$router.push('/workflow-technical-support')
    },
    goProcessTaskToSupport () {
      this.$router.push({
        path: '/workflow-technical-support',
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
    applyInternalResourceHandle () {
      this.$router.push({
        path: '/workflow-apply-internal-resource/create',
        query: {
          type: 'approval-start',
        },
      })
      // const routeUrl = this.$router.resolve({
      //   path: '/workflow-apply-internal-resource/create',
      //   query: {
      //     type: 'approval-start',
      //   },
      // })
      // window.open(routeUrl.href, '_blank')
    },
    copyHotline () {
      this.$copyText(this.companyInfo.hotline)
      this.$message.success(this.$t('common.copy'))
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
