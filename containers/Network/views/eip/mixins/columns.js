import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getBrandTableColumn,
  getProjectTableColumn,
  getRegionTableColumn,
  getTagTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import { sizestr } from '@/utils/utils'
import i18n from '@/locales'
import { getAssociateNameTableColumn, getIPWithBgpTypeTableColumn } from '../utils/columns'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('eip_hidden_columns.name')
        },
      }),
      getStatusTableColumn({
        statusModule: 'eip',
        vm: this,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('eip_hidden_columns.status')
        },
      }),
      getTagTableColumn({
        onManager: this.onManager,
        resource: 'eips',
        columns: () => this.columns,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('eip_hidden_columns.metadata')
        },
      }),
      // {
      //   field: 'ip_addr',
      //   title: 'IP',
      //   width: 140,
      //   hidden: () => {
      //     return this.$isScopedPolicyMenuHidden('eip_hidden_columns.ip_addr')
      //   },
      // },
      getIPWithBgpTypeTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('eip_hidden_columns.ip_addr')
        },
      }),
      {
        field: 'mode',
        title: this.$t('network.text_249'),
        formatter: ({ row }) => {
          if (row.mode === 'elastic_ip') {
            return this.$t('network.text_221')
          } else if (row.mode === 'public_ip') {
            return this.$t('network.public_ip')
          }
          return '-'
        },
      },
      {
        field: 'bandwidth',
        title: i18n.t('network.text_195'),
        minWidth: 80,
        showOverflow: 'ellipsis',
        formatter: ({ row, cellValue }) => {
          if (!row.bandwidth) return '-'
          return sizestr(row.bandwidth, 'M', 1024)
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('eip_hidden_columns.bandwidth')
        },
      },
      {
        field: 'charge_type',
        title: i18n.t('network.text_192'),
        minWidth: 80,
        formatter: ({ row }) => {
          const cellValue = row.charge_type
          if (cellValue === 'traffic') {
            return i18n.t('network.text_193')
          }
          if (cellValue === 'bandwidth') {
            return i18n.t('network.text_194')
          }
          return cellValue
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('eip_hidden_columns.charge_type')
        },
      },
      getBrandTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('eip_hidden_columns.brand')
        },
      }),
      {
        field: 'account',
        title: i18n.t('network.text_196'),
        minWidth: 120,
        slots: {
          default: ({ row }) => {
            if (this.isPreLoad && !row.account) return [<data-loading />]
            const ret = []
            ret.push(
              <list-body-cell-wrap hide-field copy field='account' row={row}>
                <span style={{ color: '#0A1F44' }}>{ row.account }</span>
              </list-body-cell-wrap>,
            )
            if (row.manager) {
              ret.push(
                <list-body-cell-wrap hide-field copy field='manager' row={row}>
                  <span style={{ color: '#53627C' }}>{ row.manager }</span>
                </list-body-cell-wrap>,
              )
            }
            return ret
          },
        },
        hidden: () => {
          if (this.$store.getters.isProjectMode) return true
          return this.$isScopedPolicyMenuHidden('eip_hidden_columns.account')
        },
        formatter: ({ row }) => {
          return row.account || '-'
        },
      },
      getAssociateNameTableColumn({
        vm: this,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('eip_hidden_columns.associate_name')
        },
      }),
      getProjectTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('eip_hidden_columns.tenant')
        },
      }),
      getRegionTableColumn({
        vm: this,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('eip_hidden_columns.region')
        },
      }),
      getTimeTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('eip_hidden_columns.created_at')
        },
      }),
    ]
  },
}
