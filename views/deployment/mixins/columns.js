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
        width: 120,
      },
      k8sStatusColumn(),
      {
        field: 'podsInfo',
        title: '容器组',
        width: 70,
        formatter: ({ row }) => {
          return row.podsInfo.running + ' / ' + row.podsInfo.current
        },
      },
      {
        field: 'containerImages',
        title: '镜像',
        minWidth: 200,
        slots: {
          default: ({ row }, h) => {
            return row.containerImages.map(v => {
              return (<a-tag class="d-block text-truncate" title={v.image}>{ v.image }</a-tag>)
            })
          },
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
