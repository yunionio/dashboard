import { getDomainChangeOwnerAction, getSetPublicAction } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('network.text_201'),
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
      getDomainChangeOwnerAction(this, {
        name: this.$t('dictionary.nat'),
        resource: 'natgateways',
      }),
      getSetPublicAction(this, {
        name: this.$t('dictionary.nat'),
        scope: 'domain',
        resource: 'natgateways',
      }),
    ]
  },
}
