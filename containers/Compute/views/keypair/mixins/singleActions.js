import i18n from '@/locales'
import { getSetPublicAction } from '@/utils/common/tableActions'
export default {
  created () {
    this.singleActions = [
      getSetPublicAction(this, {
        name: this.$t('compute.text_108'),
        scope: 'project',
        resource: 'keypairs',
        noCandidateDomains: true,
        projectExtraParams: {
          domain_id: this.$store.getters.userInfo.domain?.id,
        },
      }, {
        permission: 'keypairs_perform_public',
      }),
      {
        label: i18n.t('compute.perform_delete'),
        permission: 'keypairs_delete',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: i18n.t('compute.perform_delete'),
            name: this.$t('dictionary.keypair'),
            onManager: this.onManager,
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
    ]
  },
}
