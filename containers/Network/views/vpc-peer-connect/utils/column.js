import i18n from '@/locales'

export const getVpcTableColumn = (vm) => {
  return {
    field: 'vpc',
    title: i18n.t('network.local_vpc'),
    minWidth: 120,
    showOverflow: 'ellipsis',
    slots: {
      default: ({ row }, h) => {
        return [
          <side-page-trigger name='VpcSidePage' id={row.vpc_id} vm={vm}>{row.vpc}</side-page-trigger>,
        ]
      },
    },
  }
}

export const getPeerVpcTableColumn = () => {
  return {
    field: 'peer_vpc_name',
    title: i18n.t('network.peer_vpc'),
    minWidth: 120,
    showOverflow: 'ellipsis',
    slots: {
      default: ({ row }) => {
        return row.peer_vpc_name || row.peer_vpc_id || row.ext_peer_vpc_id
      },
    },
  }
}

export const getExtPeerAccountTableColumn = () => {
  return {
    field: 'ext_peer_account_id',
    title: i18n.t('network.peer_account'),
    minWidth: 120,
    showOverflow: 'title',
    slots: {
      default: ({ row }, h) => {
        const text = !row.peer_vpc_name ? `${row.peer_account_id || row.ext_peer_account_id}(${i18n.t('network.cross_account')})` : i18n.t('network.same_account')
        return [
          <list-body-cell-wrap copy field='ext_peer_account_id' row={row} hideField='true' message={text}>
            { text }
          </list-body-cell-wrap>,
        ]
      },
    },
  }
}
