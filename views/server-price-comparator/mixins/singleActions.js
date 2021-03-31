import { mapGetters } from 'vuex'
import storage from '@/utils/storage'
import { PRICE_COMPARA_KEY_SUFFIX } from '@Cloudenv/constants'

export default {
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode']),
  },
  data () {
    return {
    }
  },
  created () {
    this.singleActions = [
      {
        label: this.$t('table.action.delete'),
        action: obj => {
          let serverPriceComparator = storage.get(PRICE_COMPARA_KEY_SUFFIX) || []
          serverPriceComparator = serverPriceComparator.filter(v => v.id !== obj.id)
          storage.set(PRICE_COMPARA_KEY_SUFFIX, serverPriceComparator)
          this.refreshData()
        },
      },
    ]
  },
  methods: {
  },
}
