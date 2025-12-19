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
      // 更改项目
      {
        label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
        permission: 'llm_skus_perform_public',
        action: (obj) => {
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
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: this.$t('table.action.delete'),
            name: this.$t('aice.spec'),
            onManager: this.onManager,
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
    ]
  },
}
