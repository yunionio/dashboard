import { mapGetters } from 'vuex'
// import i18n from '@/locales'

export default {
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'isProjectMode', 'userInfo']),
  },
  created () {
    this.singleActions = []
  },
  methods: {},
}
