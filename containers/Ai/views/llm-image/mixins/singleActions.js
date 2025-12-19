import { getSetPublicAction } from '@/utils/common/tableActions'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('common.edit'),
        action: obj => {
          this.createDialog('DesktopImageCreateDialog', {
            vm: this,
            type: 'edit',
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
      },
      // 更改项目
      {
        label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
        permission: 'llm_images_perform_public',
        action: (obj) => {
          this.createDialog('ChangeOwenrDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
            resource: 'llm_images',
          })
        },
      },
      getSetPublicAction(this, {
        name: this.$t('aice.image'),
        scope: 'project',
        resource: 'llm_images',
      }, {
        permission: 'llm_images_perform_public',
      }),
      {
        label: this.$t('table.action.delete'),
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: this.$t('table.action.delete'),
            name: this.$t('aice.image'),
            onManager: this.onManager,
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
    ]
  },
}
