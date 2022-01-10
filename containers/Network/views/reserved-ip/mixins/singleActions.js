import * as R from 'ramda'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('network.text_666'),
        permission: 'reservedips_update',
        action: (obj) => {
          this.createDialog('ReservedIPFreedDialog', {
            title: i18n.t('network.text_666'),
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            name: i18n.t('network.text_651'),
            refresh: this.refresh,
            query: this.getParams,
          })
        },
        meta: (obj) => {
          let { validate, tooltip } = this.$getDeleteResult(obj)
          if (validate) {
            if (!R.isNil(this.data) && !R.isEmpty(this.data)) {
              validate = this.isOwner(this.data)
            }
          }
          return {
            validate,
            tooltip,
          }
        },
      },
    ]
  },
}
