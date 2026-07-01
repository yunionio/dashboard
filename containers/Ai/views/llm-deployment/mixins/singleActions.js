import { getRestartMeta, getScaleMeta, getSyncStatusMeta } from '@Ai/utils/aiproxyDeploymentActions'
import expectStatus from '@/constants/expectStatus'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('aice.llm_deployment.scale'),
        permission: 'llm_deployments_update',
        action: obj => {
          this.createDialog('LlmDeploymentScaleDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
        meta: obj => getScaleMeta(obj, this),
      },
      {
        label: this.$t('common.text00043'),
        permission: 'llm_deployments_perform_syncstatus',
        action: obj => {
          this.onManager('performAction', {
            id: obj.id,
            steadyStatus: {
              status: [
                ...expectStatus.llmDeployment.success,
                ...expectStatus.llmDeployment.danger,
                ...expectStatus.llmDeployment.info.filter(s => s !== 'syncstatus' && s !== 'start_syncstatus'),
              ],
            },
            managerArgs: {
              action: 'syncstatus',
              data: {},
            },
          })
        },
        meta: obj => getSyncStatusMeta(obj, this),
      },
      {
        label: this.$t('aice.llm_deployment.restart'),
        permission: 'llm_deployments_perform_restart',
        action: obj => {
          this.createDialog('LlmDeploymentRestartDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
        meta: obj => getRestartMeta(obj, this),
      },
      // 更改项目
      {
        label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
        permission: 'llm_deployments_perform_change_owner',
        action: obj => {
          this.createDialog('ChangeOwenrDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
            resource: 'llm_deployments',
          })
        },
      },
      {
        label: this.$t('table.action.delete'),
        permission: 'llm_deployments_delete',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: this.$t('table.action.delete'),
            name: this.$t('aice.llm_deployment'),
            onManager: this.onManager,
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
    ]
  },
}
