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
      getStatusTableColumn({ statusModule: 'vpcPeerConnect' }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'vpc_peering_connections', columns: () => this.columns }),
      {
        field: 'project',
        title: this.$t('common.attribution_scope'),
        slots: {
          default: ({ row }, h) => {
            const ret = []
            const domain = row.project_domain || row.domain
            if (domain) {
              ret.push(
                <list-body-cell-wrap hide-field copy field="domain" row={{ domain }}>
                  <span>{ domain }</span>
                </list-body-cell-wrap>,
              )
            }
            return ret
          },
        },
      },
      getBrandTableColumn(),
      getAccountTableColumn({ vm: this }),
    ]
  },
}
