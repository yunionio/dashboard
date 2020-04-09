import { mapGetters } from 'vuex'
import expectStatus from '@/constants/expectStatus'

export default {
  computed: mapGetters(['isAdminMode']),
  created () {
    this.singleActions = [
      {
        label: '同步状态',
        permission: 'policydefinition_perform_syncstatus',
        action: (obj) => {
          this.onManager('performAction', {
            id: obj.id,
            steadyStatus: { status: Object.values(expectStatus.policydefinition).flat() },
            managerArgs: {
              action: 'syncstatus',
              data: {},
            },
          })
        },
        meta: () => {
          return {
            validate: true,
            tooltip: '',
          }
        },
      },
    ]
  },
}
