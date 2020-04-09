import { k8sStatusColumn } from '@K8S/utils/tableColumns'
import { getNameDescriptionTableColumn } from '@/utils/common/tableColumn'

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
      },
      {
        field: 'metadata',
        title: '应用',
        formatter: ({ row }) => `${row.chart.metadata.name}/${row.chart.metadata.version || ''}`,
      },
      k8sStatusColumn({ statusModule: 'release' }),
      {
        field: 'last_deployed',
        title: '更新日期',
        width: 80,
        formatter: ({ row }) => {
          return this.$moment(row.last_deployed).fromNow()
        },
      },
      {
        field: 'creationTimestamp',
        title: '创建于',
        width: 80,
        formatter: ({ row }) => {
          return this.$moment(row.creationTimestamp).fromNow()
        },
      },
    ]
  },
}
