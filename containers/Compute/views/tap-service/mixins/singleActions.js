import { mapGetters } from 'vuex'
import i18n from '@/locales'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'

export default {
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'isProjectMode', 'userInfo']),
  },
  created () {
    this.singleActions = [
      {
        label: i18n.t('compute.add_tap_flow'),
        permission: 'tapflows_create',
        action: (obj) => {
          this.createDialog('TapFlowCreateDialog', {
            tapService: obj,
          })
        },
      },
      {
        label: i18n.t('cloudenv.text_311'),
        actions: obj => {
          return [
            // 启用禁用
            ...getEnabledSwitchActions(this, obj, ['tapservices_perform_enable', 'tapservices_perform_disable'], {
              metas: [
                () => {
                  const ret = {
                    validate: !obj.enabled,
                  }
                  return ret
                },
                () => {
                  const ret = {
                    validate: obj.enabled,
                  }
                  return ret
                },
              ],
              resourceName: this.$t('dictionary.tap_service'),
            }),
            {
              label: i18n.t('compute.perform_delete'),
              permission: 'tapservices_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: i18n.t('compute.perform_delete'),
                  name: this.$t('dictionary.tap_service'),
                  onManager: this.onManager,
                })
              },
              meta: () => {
                const ret = {
                  validate: true,
                }
                if (obj.flow_count) {
                  ret.validate = false
                  ret.tooltip = i18n.t('compute.tap_service_delete_tip')
                }
                return ret
              },
            },
          ]
        },
      },
    ]
  },
  methods: {},
}
