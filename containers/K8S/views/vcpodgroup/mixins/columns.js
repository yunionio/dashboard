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
        field: 'namespace',
        title: i18n.t('k8s.text_23'),
        width: 140,
        sortable: true,
      },
      {
        field: 'queue',
        title: i18n.t('k8s.vc_queue_field'),
        width: 140,
      },
      {
        field: 'minMember',
        title: i18n.t('k8s.vc_min_member'),
        width: 120,
      },
      k8sStatusColumn({ statusModule: 'k8s_resource_vcpodgroup' }),
      getTimeTableColumn({ field: 'creationTimestamp', fromNow: true, sortable: true }),
    ]
  },
}
