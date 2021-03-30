<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import { mapGetters } from 'vuex'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import storage from '@/utils/storage'
import { SERVER_PRICE_COMPARA_KEY_SUFFIX } from '@Cloudenv/constants'

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
        responseData: this.responseData,
      }),
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'isAdminMode']),
  },
  created () {
    this.refreshData()
  },
  methods: {
    refreshData () {
      const data = storage.get(SERVER_PRICE_COMPARA_KEY_SUFFIX) || []
      this.list.responseData = { data: data.filter(v => v.uid === this.userInfo.id) }
      this.list.fetchData()
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
