import { mapGetters } from 'vuex'
import i18n from '@/locales'
import { Manager } from '@/utils/manager'

export default {
  data () {
    return {
      curProcess: 'me-process',
      isExtraUsers: true,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode']),
    tabPanels () {
      const tablePanels = [
        {
          name: 'me-process',
          label: i18n.t('common_412'),
        },
        {
          name: 'approval-start',
          label: i18n.t('common.workflow.approval_start'),
        },
        {
          name: 'approved-done',
          label: i18n.t('common.workflow.approval_done'),
        },
      ]
      if (this.isExtraUsers) {
        tablePanels.push({
          name: 'third-process',
          label: i18n.t('common_415'),
        })
      }
      if (this.isAdminMode || this.isDomainMode) {
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
    this.fetchExtraUsers()
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
    fetchExtraUsers () {
      new Manager('extra-users', 'v1').list().then((res) => {
        const { data } = res.data
        if (data.length > 0) {
          this.isExtraUsers = true
        } else {
          this.isExtraUsers = false
        }
      }).catch(() => {
        this.isExtraUsers = false
      })
    },
  },
}
