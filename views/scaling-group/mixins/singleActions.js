import expectStatus from '@/constants/expectStatus'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      ...getEnabledSwitchActions(this, undefined, ['scalinggroups_perform_enable', 'scalinggroups_perform_disable']),
      {
        label: i18n.t('compute.text_261'),
        permission: 'scalinggroups_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            title: i18n.t('compute.text_261'),
            name: i18n.t('compute.text_95'),
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            steadyStatus: Object.values(expectStatus.scalinggroup).flat(),
          })
        },
        meta: (obj) => {
          let tooltip = ''
          if (obj.enabled) {
            tooltip = i18n.t('compute.text_954')
          }
          if (obj.instance_number) {
            tooltip = i18n.t('compute.text_955')
          }
          return {
            validate: !obj.enabled && !obj.instance_number,
            tooltip,
          }
        },
      },
    ]
  },
}
