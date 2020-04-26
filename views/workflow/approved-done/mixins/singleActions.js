import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['userInfo']),
  },
  created () {
    this.singleActions = []
  },
}
