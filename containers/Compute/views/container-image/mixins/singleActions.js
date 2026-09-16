import { getSetPublicAction } from '@/utils/common/tableActions'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('common.edit'),
        permission: 'container_images_update',
        action: obj => {
          this.createDialog('ContainerImageCreateDialog', {
            vm: this,
            type: 'edit',
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
      },
      {
        label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
        permission: 'container_images_perform_change_owner',
        action: (obj) => {
          this.createDialog('ChangeOwenrDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
            resource: 'container_images',
          })
        },
      },
      getSetPublicAction(this, {
        name: this.$t('dictionary.container_image'),
        scope: 'project',
        resource: 'container_images',
      }, {
        permission: 'container_images_perform_public',
      }),
      {
        label: this.$t('table.action.delete'),
        permission: 'container_images_delete',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: this.$t('table.action.delete'),
            name: this.$t('dictionary.container_image'),
            onManager: this.onManager,
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
    ]
  },
}
