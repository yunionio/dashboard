import { getSetPublicAction } from '@/utils/common/tableActions'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('table.action.modify'),
        permission: 'llm_skus_update',
        action: obj => {
          this.createDialog('LlmSkuCreateDialog', {
            type: 'edit',
            data: [obj],
            onManager: this.onManager,
          })
        },
      },
      {
        label: this.$t('common_378'),
        action: obj => {
          this.$router.push({
            path: '/llm-deployment/create',
            query: { from_sku: obj.id },
          })
        },
        hidden: () => this.isApplyType || this.isDesktopType,
      },
      {
        label: this.$t('common.more'),
        actions: (obj) => {
          return [
            {
              label: this.$t('common.action.clone'),
              permission: 'llm_skus_perform_clone',
              action: () => {
                this.createDialog('LlmSkuCloneDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: () => {
                if (obj.status === 'importing_model') {
                  return {
                    validate: false,
                    tooltip: this.$t('aice.llm_sku.clone.importing'),
                  }
                }
                if (obj.status === 'import_model_failed') {
                  return {
                    validate: false,
                    tooltip: this.$t('aice.llm_sku.clone.import_failed'),
                  }
                }
                return { validate: true }
              },
            },
            // 更改项目
            {
              label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
              permission: 'llm_skus_perform_public',
              action: () => {
                this.createDialog('ChangeOwenrDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  resource: 'llm_skus',
                })
              },
            },
            getSetPublicAction(this, {
              name: this.$t('aice.spec'),
              scope: 'project',
              resource: 'llm_skus',
            }, {
              permission: 'llm_skus_perform_public',
            }),
            {
              label: this.$t('table.action.delete'),
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: this.$t('table.action.delete'),
                  name: this.$t('aice.spec'),
                  onManager: this.onManager,
                })
              },
              meta: () => this.$getDeleteResult(obj),
            },
          ]
        },
      },
    ]
  },
}
