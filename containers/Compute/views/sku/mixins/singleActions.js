import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'
import { findPlatform } from '@/utils/common/hypervisor'
import { SERVER_TYPE } from '../../../constants'

export default {
  computed: {
    singleActions () {
      const singleActions = [
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
            const env = findPlatform(obj.provider, 'provider')
            if (!obj.enabled) {
              validate = false
              tooltip = i18n.t('compute.text_1057')
            }
            if (env === SERVER_TYPE.public || env === SERVER_TYPE.private) {
              validate = false
              tooltip = this.$t(`commpute.${env}_sku_disable_tooltip`)
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
              ...getEnabledSwitchActions(this, obj, ['skus_update', 'skus_update'], {
                metas: [
                  () => {
                    let tooltip = ''
                    let validate = true
                    const env = findPlatform(obj.provider, 'provider')
                    if (env === SERVER_TYPE.private) {
                      validate = false
                      tooltip = this.$t(`commpute.${env}_sku_disable_tooltip`)
                    }
                    return {
                      validate,
                      tooltip,
                    }
                  },
                  () => {
                    let tooltip = ''
                    let validate = true
                    const env = findPlatform(obj.provider, 'provider')
                    if (env === SERVER_TYPE.private) {
                      validate = false
                      tooltip = this.$t(`commpute.${env}_sku_disable_tooltip`)
                    }
                    return {
                      validate,
                      tooltip,
                    }
                  },
                ],
              }),
              {
                label: i18n.t('compute.sku.setup.sell.status'),
                permission: 'skus_update',
                action: () => {
                  this.createDialog('ServerSkuUpdateDialog', {
                    vm: this,
                    data: [obj],
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
                meta: (obj) => {
                  let tooltip = ''
                  let validate = true
                  const env = findPlatform(obj.provider, 'provider')
                  if (env === SERVER_TYPE.private) {
                    validate = false
                    tooltip = this.$t(`commpute.${env}_sku_disable_tooltip`)
                  }
                  return {
                    validate,
                    tooltip,
                  }
                },
              },
              {
                label: i18n.t('compute.perform_delete'),
                permission: 'skus_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: [obj],
                    columns: this.columns,
                    title: i18n.t('compute.perform_delete'),
                    name: this.$t('dictionary.sku'),
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  return this.$getDeleteResult(obj)
                },
              },
            ]
          },
        },
      ]
      return singleActions
    },
  },
}
