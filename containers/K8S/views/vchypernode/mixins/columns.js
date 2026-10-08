import { k8sStatusColumn } from '@K8S/utils/tableColumns'
import { getNameDescriptionTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        edit: false,
        showDesc: false,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'tier',
        title: i18n.t('k8s.vc_tier'),
        width: 80,
      },
      {
        field: 'tierName',
        title: i18n.t('k8s.vc_tier_name'),
        minWidth: 120,
      },
      {
        field: 'nodeCount',
        title: i18n.t('k8s.vc_node_count'),
        width: 100,
      },
      k8sStatusColumn({ statusModule: 'k8s_resource_vchypernode' }),
      getTimeTableColumn({ field: 'creationTimestamp', fromNow: true, sortable: true }),
    ]
  },
}
