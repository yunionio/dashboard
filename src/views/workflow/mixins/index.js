import { mapGetters } from 'vuex'
import i18n from '@/locales'

export default {
  data () {
    return {
      curProcess: 'me-process',
    }
  },
  computed: {
    ...mapGetters(['isAdminMode']),
    tabPanels () {
      const tablePanels = [
        {
          name: 'me-process',
          label: i18n.t('common_412'),
        },
        {
          name: 'approval-start',
          label: i18n.t('common_203'),
        },
        {
          name: 'approved-done',
          label: i18n.t('common_413'),
        },
        {
          name: 'me-partake',
          label: i18n.t('common_414'),
        },
        {
          name: 'third-process',
          label: i18n.t('common_415'),
        },
      ]
      if (this.isAdminMode) {
        tablePanels.push({
          name: 'all-process',
          label: i18n.t('common.all_process'),
        })
      }
      return tablePanels
    },
  },
  watch: {
    $route: 'changeProcess',
  },
  created () {
    this.curProcess = this.$route.query.type || 'me-process'
    this.$router.replace({
      path: this.$route.path,
      query: { ...this.$route.query, type: this.curProcess },
    })
  },
  methods: {
    curProcessHandle (key) {
      this.curProcess = key
      this.$router.replace({
        path: this.$route.path,
        query: { ...this.$route.query, type: this.curProcess },
      })
    },
    changeProcess () {
      this.curProcess = this.$route.query.type || 'me-process'
    },
  },
}
