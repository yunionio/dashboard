export default {
  data () {
    return {
      curProcess: 'me-process',
      tabPanels: [
        {
          name: 'me-process',
          label: '我发起的',
        },
        {
          name: 'approval-start',
          label: '待我审批',
        },
        {
          name: 'approved-done',
          label: '我已审批',
        },
        {
          name: 'me-partake',
          label: '我参与的',
        },
        {
          name: 'third-process',
          label: '第三方',
        },
      ],
    }
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
