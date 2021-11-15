import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getTagTableColumn,
  getBrandTableColumn,
  getAccountTableColumn,
} from '@/utils/common/tableColumn'

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
      }),
      getStatusTableColumn({ statusModule: 'vpcNetwork' }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'inter_vpc_networks', columns: () => this.columns }),
      {
        field: 'vpc_count',
        title: this.$t('network.text_243'),
        minWidth: 100,
        sortable: true,
        slots: {
          default: ({ row }) => {
            return [
              <side-page-trigger name='VpcNetworkSidePage' id={row.id} tab='vpc' vm={this} init>{row.vpc_count}</side-page-trigger>,
            ]
          },
        },
      },
      {
        field: 'project',
        title: this.$t('common.attribution_scope'),
        slots: {
          default: ({ row }, h) => {
            if (!row.tenant && !row.project_domain) {
              return this.$t('shareScope.system')
            }
            const domain = row.project_domain || row.domain
            if (!row.tenant && domain) {
              return `${domain}${this.$t('shareScope.domain')}`
            }
            if (row.tenant && domain) {
              return [
                <list-body-cell-wrap copy field='tenant' row={row} />,
                <list-body-cell-wrap hide-field copy field="domain" row={{ domain }}>
                  <span class='text-weak'>{ domain }</span>
                </list-body-cell-wrap>,
              ]
            }
          },
        },
      },
      getBrandTableColumn(),
      getAccountTableColumn({ vm: this }),
    ]
  },
}
