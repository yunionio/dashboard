import {
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        edit: false,
        editDesc: false,
        title: i18n.t('network.text_21'),
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'match_scope',
        title: i18n.t('network.ssh-proxy-match.match_scope'),
        slots: {
          default: ({ row }) => {
            return row.match_scope === 'vpc' ? this.$t('cloudenv.res_vpcs') : this.$t('network.text_565')
          },
        },
      },
      {
        field: 'match_value',
        title: i18n.t('network.ssh-proxy-match.vpc_ip_subnet'),
        slots: {
          default: ({ row }) => {
            const m = this.list.extraData[row.match_scope]
            return m && m[row.match_value] ? m[row.match_value] : row.match_value
          },
        },
      },
    ]
  },
}
