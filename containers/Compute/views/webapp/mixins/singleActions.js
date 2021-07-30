export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('common.text00043'),
        action: (obj) => {
          this.onManager('performAction', {
            steadyStatus: ['running', 'ready'],
            id: obj.id,
            managerArgs: {
              action: 'syncstatus',
            },
          })
        },
        meta: (obj) => {
          const ret = {
            validate: false,
            tooltip: null,
          }
          if (['failed'].includes(obj.status)) return ret
          ret.validate = true
          return ret
        },
      },
    ]
  },
}
