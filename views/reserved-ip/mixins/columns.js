import { getCopyWithContentTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getCopyWithContentTableColumn({
        field: 'network',
        title: 'IP子网',
      }),
      getCopyWithContentTableColumn({
        field: 'ip_addr',
        title: 'IP地址',
      }),
      {
        field: 'notes',
        title: '备注',
        slots: {
          default: ({ row }, h) => {
            return [
              h('list-body-cell-wrap', {
                props: {
                  formRules: [
                    { required: true, message: '请输入备注' },
                  ],
                  row,
                  edit: true,
                  copy: true,
                  onManager: this.onManager,
                  field: 'notes',
                },
              }),
            ]
          },
        },
      },
      getTimeTableColumn(),
    ]
  },
}
