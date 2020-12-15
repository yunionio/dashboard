import _ from 'lodash'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    const cloudEnv = _.get(this.params, 'options.cloudEnv') || this.cloudEnv
    this.singleActions = [
      {
        label: i18n.t('compute.text_983'),
        permission: 'skus_create',
        action: obj => {
          this.createDialog('CloneSkuUpdateDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
        meta: obj => {
          let tooltip = ''
          let validate = true
          if (cloudEnv === 'public') {
            validate = false
            tooltip = this.$t('commpute.public_sku_disable_tooltip')
          }
          if (!obj.enabled) {
            validate = false
            tooltip = i18n.t('compute.text_1057')
          }
          return {
            validate,
            tooltip,
          }
        },
      },
      {
        label: i18n.t('compute.text_352'),
        actions: obj => {
          return [
            ...getEnabledSwitchActions(this, obj, 'skus_update', 'skus_update'),
            {
              label: i18n.t('compute.text_261'),
              permission: 'skus_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: i18n.t('compute.text_261'),
                  name: this.$t('dictionary.sku'),
                  onManager: this.onManager,
                })
              },
              meta: () => {
                if (cloudEnv === 'public') {
                  return {
                    validate: false,
                    tooltip: this.$t('commpute.public_sku_disable_tooltip'),
                  }
                }
                return this.$getDeleteResult(obj)
              },
            },
          ]
        },
      },
    ]
  },
}
