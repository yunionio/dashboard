import { mapGetters } from 'vuex'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('cloudenv.text_463'),
        action: (obj) => {
          this.createDialog('CdnHostnameCreateDialog', {
            onManager: this.onManager,
            type: 'edit',
            data: [obj],
            title: i18n.t('cloudenv.text_463'),
          })
        },
      },
      {
        label: i18n.t('network.text_131'),
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            title: i18n.t('network.text_131'),
            name: this.$t('network.cdn_custom_hostname'),
            data: [obj],
            columns: this.columns,
            ok: async (ids) => {
              await new this.$Manager(`cdn_domains/${this.cdnId}/delete-custom-hostname`).batchPost({
                data: { id: obj.id },
              })
              this.list.refresh()
            },
          })
        },
      },
    ]
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo']),
  },
  methods: {
    isOwner (obj) {
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return false
    },
  },
}
