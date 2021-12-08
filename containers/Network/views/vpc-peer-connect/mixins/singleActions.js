export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('network.text_201'),
        action: obj => {
          this.onManager('performAction', {
            steadyStatus: ['running', 'ready'],
            id: obj.id,
            managerArgs: {
              action: 'syncstatus',
            },
          })
        },
        meta: () => ({
          validate: true,
        }),
      },
      {
        label: this.$t('network.vpc_network.manage_vpc'),
        action: (obj) => {
          this.sidePageTriggerHandle(this, 'VpcPeerConnectSidePage', {
            id: obj.id,
            resource: 'vpc_peering_connections',
            getParams: this.getParam,
          }, {
            tab: 'vpc',
          })
        },
      },
      {
        label: this.$t('network.text_131'),
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            title: this.$t('network.text_131'),
            name: this.$t('dictionary.vpc_network'),
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
        meta: (obj) => {
          return this.$getDeleteResult(obj)
        },
      },
    ]
  },
}
