import { getSetPublicAction } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('cloudenv.text_406'),
        permission: 'proxysettings_update',
        action: (row) => {
          this.createDialog('ProxysettingUpdateDialog', {
            data: [row],
            columns: this.columns,
            title: i18n.t('cloudenv.text_406'),
            onManager: this.onManager,
          })
        },
        meta: this.commonMeta,
      },
      getSetPublicAction(this, {
        name: this.$t('dictionary.proxysetting'),
        scope: 'domain',
        resource: 'proxysettings',
      }, {
        permission: 'proxysettings_perform_public',
        meta: this.commonMeta,
      }),
      {
        label: i18n.t('cloudenv.text_108'),
        permission: 'proxysettings_delete',
        action: (row) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [row],
            columns: this.columns,
            title: i18n.t('cloudenv.text_108'),
            name: this.$t('dictionary.proxysetting'),
            onManager: this.onManager,
          })
        },
        meta: (row) => this.commonMeta(row, 'delete'),
      },
    ]
  },
  methods: {
    commonMeta (row = {}, action) {
      const { id } = row
      const isDirect = id === 'DIRECT'
      if (!row.can_delete && action === 'delete') {
        return {
          validate: false,
          tooltip: i18n.t('cloudenv.text_412'),
        }
      }
      if (isDirect) {
        return {
          validate: false,
          tooltip: i18n.t('cloudenv.text_404'),
        }
      }
      const { isDomainMode, userInfo } = this.$store.getters
      if (isDomainMode && (userInfo.projectDomainId !== row.domain_id)) {
        return {
          validate: false,
          tooltip: i18n.t('cloudenv.text_405'),
        }
      }
      return {
        isDirect,
        validate: true,
      }
    },
  },
}
