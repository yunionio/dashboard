import expectStatus from '@/constants/expectStatus'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('common.text00043'),
        permission: 'route_tables_syncstatus',
        action: obj => {
          this.onManager('performAction', {
            steadyStatus: Object.values(expectStatus.routeTable).flat(),
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
        label: this.$t('network.manage_route'),
        action: obj => {
          this.sidePageTriggerHandle(this, 'RouteTableSidePage', {
            id: obj.id,
            resource: 'route_tables',
            getParams: this.getParam,
          }, {
            tab: 'route-set',
          })
        },
      },
    ]
  },
}
