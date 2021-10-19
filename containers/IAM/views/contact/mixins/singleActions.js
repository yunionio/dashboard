import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('system.text_152'),
        action: (obj) => {
          const contact = this.parseDetail(obj.details)
          this.createDialog('ContactUpdateDialog', {
            data: [
              { ...obj, contact },
            ],
            columns: this.columns,
            success: () => {
              this.refresh()
            },
          })
        },
      },
      {
        label: i18n.t('system.text_153'),
        actions: obj => {
          return [
            ...getEnabledSwitchActions(this),
            {
              label: i18n.t('system.text_129'),
              action: (obj) => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: i18n.t('system.text_129'),
                  name: this.$t('dictionary.receiver'),
                  onManager: this.onManager,
                })
              },
              meta: () => this.$getDeleteResult(obj),
            },
          ]
        },
      },
    ]
  },
}
