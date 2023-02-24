<template>
  <page-list
    :list="list"
    :columns="columns"
    :showSync="false"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import { mapGetters } from 'vuex'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import storage from '@/utils/storage'
import { PRICE_COMPARA_KEY_SUFFIX } from '@Cloudenv/constants'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'PriceVMInstanceList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: this.getData,
      }),
      groupActions: [
        {
          label: this.$t('bill.text_193'),
          permission: 'server_create',
          action: (row) => {
            this.$router.push({
              path: '/pricecomparator/create',
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('cloudenv.text_108'),
          action: () => {
            let serverPriceComparator = storage.get(PRICE_COMPARA_KEY_SUFFIX) || []
            const selectedIds = this.list.selectedItems.map(v => v.id)
            serverPriceComparator = serverPriceComparator.filter(v => !selectedIds.includes(v.id))
            storage.set(PRICE_COMPARA_KEY_SUFFIX, serverPriceComparator)
            this.refreshData()
          },
          meta: () => {
            const ret = { validate: true }
            if (this.list.selectedItems.length <= 0) {
              ret.validate = false
            }
            return ret
          },
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'isAdminMode']),
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getData (params) {
      const data = storage.get(PRICE_COMPARA_KEY_SUFFIX) || []
      const list = data.filter(v => v.uid === this.userInfo.id)
      return {
        data: {
          data: list.slice(params.offset || 0, (params.offset || 0) + params.limit),
          total: list.length,
          offset: params.offset || 0,
          limit: params.limit,
        },
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import "../../../../../src/styles/less/theme";

.hour {
  color: @error-color;
  font-size: 24px;
}
</style>
