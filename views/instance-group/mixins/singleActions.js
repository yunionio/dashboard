import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('compute.text_483', [this.$t('dictionary.server')]),
        action: (obj) => {
          this.createDialog('InstanceGroupBindServerDialog', {
            columns: this.columns,
            data: [obj],
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
        meta: (obj) => ({
          validate: obj.enabled,
          tooltip: !obj.enabled ? i18n.t('compute.text_717') : null,
        }),
      },
      {
        label: i18n.t('compute.text_352'),
        actions: obj => {
          return [
            ...getEnabledSwitchActions(this, obj),
            {
              label: i18n.t('compute.text_261'),
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: this.$t('compute.text_700', [this.$t('dictionary.instancegroup')]),
                  name: this.$t('dictionary.instancegroup'),
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
