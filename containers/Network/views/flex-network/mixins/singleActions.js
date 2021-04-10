import { getDomainChangeOwnerAction, getSetPublicAction } from '@/utils/common/tableActions'

export default {
  created () {
    this.singleActions = [
      getDomainChangeOwnerAction(this, {
        name: this.$t('dictionary.networkinterface'),
        resource: 'networkinterfaces',
      }),
      getSetPublicAction(this, {
        name: this.$t('dictionary.networkinterface'),
        scope: 'domain',
        resource: 'networkinterfaces',
      }),
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
    ]
  },
}
