import { k8sStatusColumn, k8sLabelColumn } from '@K8S/utils/tableColumns'
import { getNameDescriptionTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'

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
        title: '命名空间',
        sortable: true,
      },
      k8sStatusColumn(),
      k8sLabelColumn(),
      {
        field: 'volume',
        title: '存储卷',
        minWidth: 120,
      },
      {
        field: 'capacity.storage',
        title: '存储总量',
        width: 70,
        formatter: ({ row }) => {
          return row.capacity ? (row.capacity.storage || '0Gi') : '-'
        },
      },
      {
        field: 'accessModes',
        title: '访问模式',
        formatter: ({ row }) => row.accessModes.join('，'),
      },
      {
        field: 'storageClass',
        title: '存储类',
      },
      {
        field: 'unused',
        title: '使用情况',
        slots: {
          default: ({ row }, h) => {
            let text = '未被使用'
            let className = 'success-color'
            if (row.mountedBy && row.mountedBy.length > 0) {
              text = '被使用'
              className = 'error-color'
            }
            return [<div class={className}>{text}</div>]
          },
        },
      },
      getTimeTableColumn({ field: 'creationTimestamp', fromNow: true, sortable: true }),
    ]
  },
}
