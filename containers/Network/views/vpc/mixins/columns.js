import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getCopyWithContentTableColumn,
  getRegionTableColumn,
  getBrandTableColumn,
  getAccountTableColumn,
  getPublicScopeTableColumn,
  getProjectDomainTableColumn,
  getTagTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

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
          return this.$isScopedPolicyMenuHidden('vpc_hidden_columns.name')
        },
      }),
      getStatusTableColumn({
        statusModule: 'vpc',
        vm: this,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('vpc_hidden_columns.status')
        },
      }),
      getTagTableColumn({
        onManager: this.onManager,
        resource: 'vpcs',
        columns: () => this.columns,
        editCheck: (row) => (row.provider || '').toLowerCase() !== 'bingocloud',
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('vpc_hidden_columns.metadata')
        },
      }),
      getCopyWithContentTableColumn({
        field: 'cidr_block',
        title: i18n.t('network.vpc.cidr_block.ipv4.label'),
        width: 180,
        sortable: true,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('vpc_hidden_columns.cidr_block')
        },
      }),
      getCopyWithContentTableColumn({
        field: 'cidr_block6',
        title: i18n.t('network.vpc.cidr_block.ipv6.label'),
        width: 180,
        sortable: true,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('vpc_hidden_columns.cidr_block6')
        },
      }),
      {
        field: 'external_access_mode',
        title: this.$t('network.external_access_mode_label'),
        formatter: ({ row }) => {
          if (row.external_access_mode === 'none') return this.$t('status.enabled.false')
          return this.$t('status.enabled.true')
        },
      },
      {
        field: 'wire_count',
        title: i18n.t('network.text_571'),
        width: 100,
        sortable: true,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('vpc_hidden_columns.wire_count')
        },
      },
      {
        field: 'network_count',
        title: i18n.t('network.text_682'),
        width: 80,
        sortable: true,
        slots: {
          default: ({ row }) => {
            if (row.network_count <= 0) return row.network_count
            return [
              <side-page-trigger name='VpcSidePage' id={row.id} tab='network-list' vm={this}>{row.network_count}</side-page-trigger>,
            ]
          },
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('vpc_hidden_columns.network_count')
        },
      },
      getBrandTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('vpc_hidden_columns.brand')
        },
      }),
      getAccountTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('vpc_hidden_columns.account')
        },
      }),
      getPublicScopeTableColumn({
        vm: this,
        resource: 'vpcs',
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('vpc_hidden_columns.public_scope')
        },
      }),
      getProjectDomainTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('vpc_hidden_columns.tenant')
        },
      }),
      getRegionTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('vpc_hidden_columns.region')
        },
      }),
      getTimeTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('vpc_hidden_columns.created_at')
        },
      }),
    ]
  },
}
