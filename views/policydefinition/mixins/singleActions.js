import { mapGetters } from 'vuex'
import expectStatus from '@/constants/expectStatus'
import i18n from '@/locales'

export default {
  computed: mapGetters(['isAdminMode']),
  created () {
    this.singleActions = [
      {
        label: i18n.t('cloudenv.text_354'),
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
