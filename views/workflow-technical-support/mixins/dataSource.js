import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['userInfo']),
    readOnly () {
      return false
    },
  },
  methods: {
    fetchDataById (id) {
      new this.$Manager('historic-process-instances', 'v1').list({
        params: {
          id,
          process_definition_key: 'customer-service',
        },
      }).then(res => {
        this.dataSource = res.data.data
        if (this.dataSource.length > 0) {
          const curData = this.dataSource[0]
          if (curData.start_user_id === this.userInfo.id) {
            this.extParams = {
              is_initial: true,
              approved: false,
            }
          }
        }
      }).catch((err) => {
        this.dataSource = []
        throw err
      })
    },
  },
}
