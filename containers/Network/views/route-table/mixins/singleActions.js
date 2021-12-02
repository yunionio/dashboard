import expectStatus from '@/constants/expectStatus'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('common.text00043'),
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
    ]
  },
}
