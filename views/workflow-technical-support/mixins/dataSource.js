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
      }).catch((err) => {
        this.dataSource = []
        throw err
      })
    },
  },
}
