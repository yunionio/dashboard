import { getDomainChangeOwnerAction, getSetPublicAction } from '@/utils/common/tableActions'

export default {
  created () {
    this.singleActions = [
      // {
      //   label: '同步状态',
      //   action: obj => {
      //     this.onManager('performAction', {
      //       steadyStatus: ['running', 'ready'],
      //       id: obj.id,
      //       managerArgs: {
      //         action: 'syncstatus',
      //       },
      //     })
      //   },
      //   meta: () => ({
      //     validate: true,
      //   }),
      // },
      getDomainChangeOwnerAction(this, {
        name: this.$t('dictionary.route_table'),
        resource: 'route_tables',
      }),
      getSetPublicAction(this, {
        name: this.$t('dictionary.route_table'),
        scope: 'domain',
        resource: 'route_tables',
      }),
    ]
  },
}
