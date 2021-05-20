import {
  getNameDescriptionTableColumn,
  // getCopyWithContentTableColumn,
  getProjectDomainTableColumn,
  // getPublicScopeTableColumn,
  getStatusTableColumn,
  getEnabledTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        edit: (row) => {
          const { isDomainMode, userInfo } = this.$store.getters
          if (isDomainMode && (userInfo.projectDomainId !== row.domain_id)) {
            return false
          }
          return true
        },
        showDesc: (row) => {
          const { isDomainMode, userInfo } = this.$store.getters
          if (isDomainMode && (userInfo.projectDomainId !== row.domain_id)) {
            return false
          }
          return true
        },
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({
        statusModule: 'projectMapping',
        minWidth: 100,
      }),
      getEnabledTableColumn(),
      // {
      //   field: 'amount_table',
      //   title: i18n.t('bill.text_128'),
      //   type: 'expand',
      //   slots: {
      //     default: ({ row }) => {
      //       return this.currencySign + ' ' + numerify(row.amount, '0,0.000000')
      //     },
      //     content: ({ row }) => {
      //       const columns = [
      //         {
      //           field: 'usage_type',
      //           title: i18n.t('bill.text_73'),
      //           formatter: ({ row }) => {
      //             if (this.$te(`bill_resource_type.${row.usage_type}`)) {
      //               return this.$t(`bill_resource_type.${row.usage_type}`)
      //             }
      //             return row.usage_type
      //           },
      //         },
      //         {
      //           field: 'spec',
      //           title: i18n.t('bill.text_121'),
      //         },
      //         {
      //           field: 'usage',
      //           title: i18n.t('bill.text_131'),
      //           // align: 'right',
      //           formatter: ({ row }) => {
      //             let unit = row.usage_unit ? row.usage_unit.replace(/\//g, '*') : ''
      //             unit = unit.startsWith('*') ? unit.substring(1) : unit
      //             const usage = mathRoundFix(row.usage, PRECISION) // 保留6位小数，不够也不需要补0
      //             return `${usage} ${unit}`
      //           },
      //         },
      //         {
      //           field: 'rate',
      //           title: i18n.t('bill.text_37'),
      //           // align: 'right',
      //           // headerAlign: 'right',
      //           formatter: ({ row }) => {
      //             const currency = this.currencySign === '￥' ? this.$t('bill.text_29') : this.$t('bill.text_31')
      //             return `${mathRoundFix(row.rate, PRECISION, true)} ${currency}${row.price_unit}`
      //           },
      //         },
      //         {
      //           field: 'gross_amount',
      //           title: i18n.t('bill.text_123'),
      //           // align: 'right',
      //           // headerAlign: 'right',
      //           formatter: ({ row }) => {
      //             return `${this.currencySign}${mathRoundFix(row.gross_amount, PRECISION, true)}`
      //           },
      //         },
      //         {
      //           field: 'discount_amount',
      //           title: i18n.t('bill.text_124'),
      //           // align: 'right',
      //           // headerAlign: 'right',
      //           formatter: ({ row }) => {
      //             return `${this.currencySign}${mathRoundFix(row.discount_amount, PRECISION, true)}`
      //           },
      //         },
      //         {
      //           field: 'amount',
      //           title: i18n.t('bill.text_125'),
      //           // align: 'right',
      //           // headerAlign: 'right',
      //           formatter: ({ row }) => {
      //             return `${this.currencySign}${mathRoundFix(row.amount, PRECISION, true)}`
      //           },
      //         },
      //       ]
      //       return <vxe-grid size="mini" border columns={columns} data={row.content} />
      //     },
      //   },
      // },
      {
        title: i18n.t('cloudenv.text_582'),
        field: 'rules',
        slots: {
          default: ({ row }) => {
            return [<div>{ row.rules ? row.rules.length : '-' }</div>]
          },
        },
      },
      {
        title: i18n.t('cloudenv.text_589'),
        field: 'account',
        slots: {
          default: ({ row }) => {
            if (row.accounts) {
              return row.accounts.map(item => {
                return <div class="text-color-secondary">{item.name}</div>
              })
            }
            return '-'
          },
        },
      },
      getProjectDomainTableColumn({ sortable: false }),
    ]
  },
}
