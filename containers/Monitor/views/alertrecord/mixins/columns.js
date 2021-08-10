import { getTimeTableColumn, getStatusTableColumn, getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import { strategyColumn, levelColumn } from '@Monitor/views/commonalert/utils'
import { BRAND_MAP } from '@/constants'

export default {
  created () {
    let columns = [
      getNameDescriptionTableColumn({
        edit: false,
        title: this.$t('monitor.text_99'),
        hideField: true,
        field: 'alert_name',
        onManager: this.onManager,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.alert_name }</side-page-trigger>
          )
        },
      }),
      getTimeTableColumn({ title: this.$t('monitor.text_14') }),
      getStatusTableColumn({ statusModule: 'alertrecord', field: 'state' }),
      {
        field: 'type',
        title: this.$t('monitor.text_97'),
        minWidth: 80,
        formatter: ({ row }) => {
          if (row.alert_rule.res_type) {
            if (this.$te(`dictionary.${row.alert_rule.res_type}`)) {
              return this.$t(`dictionary.${row.alert_rule.res_type}`)
            }
          }
          return '-'
        },
      },
      strategyColumn('alert_rule'),
      levelColumn,
      {
        field: 'res_num',
        title: this.$t('cloudenv.text_417'),
        minWidth: 80,
        type: 'expand',
        slots: {
          default: ({ row }) => {
            return row.res_num
          },
          content: ({ row }) => {
            const columns = [
              {
                field: 'name',
                title: this.$t('dashboard.text_110'),
                formatter: ({ row }) => row.tags.name || '-',
              },
              {
                field: 'ip',
                title: 'IP',
                formatter: ({ row }) => row.tags.ip || '-',
              },
              {
                field: 'brand',
                title: this.$t('compute.text_176'),
                formatter: ({ row }) => {
                  let brand = row.tags.brand
                  if (!brand) return '-'
                  if (brand === 'kvm') brand = 'OneCloud'
                  return (BRAND_MAP[brand] && BRAND_MAP[brand].label) || brand
                },
              },
              {
                field: 'value_str',
                title: row.state === 'ok' ? this.$t('monitor.text_106') : this.$t('monitor.text_105'),
                align: 'right',
                formatter: ({ row }) => row.value_str,
              },
            ]
            return <vxe-grid size="mini" border columns={columns} data={row.eval_data} />
          },
        },
      },
      {
        field: 'send_state',
        title: this.$t('common.sendState'),
        formatter: ({ row }) => this.$t(`status.alertSendState.${row.send_state}`),
      },
    ]
    if (this.hiddenColumns.length) {
      columns = columns.filter(item => {
        return !this.hiddenColumns.some(item2 => item2 === item.field)
      })
    }
    this.columns = columns
    this.extandData = {}
  },
}
