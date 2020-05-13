import { getNameDescriptionTableColumn, isPublicTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        edit: true,
        showDesc: false,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'url',
        title: '类型',
        minWidth: 80,
        formatter: ({ row }) => {
          if (row.type === 'internal') return '虚拟机类型'
          if (row.type === 'external') return '容器类型'
          return '-'
        },
      },
      {
        field: 'url',
        title: 'URL地址',
        minWidth: '200px',
        slots: {
          default: ({ row }, h) => {
            const formRules = [
              { required: true, message: '请输入URL', trigger: 'blur' },
              { validator: this.$validate('url') },
            ]
            return [h('list-body-cell-wrap', {
              props: {
                copy: true,
                edit: true,
                row,
                onManager: this.onManager,
                field: 'url',
                formRules,
              },
            })]
          },
        },
      },
      isPublicTableColumn(),
      getTimeTableColumn({ field: 'created_at', fromNow: true, sortable: true }),
    ]
  },
}
