
<template>
  <page-list
    :list="list"
    :columns="columns"
    ref="pagelist"
    @refresh="setNavbarAlert"
    :expandConfig="expandConfig" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter, getTenantFilter, getStatusFilter } from '@/utils/common/tableFilter'

export default {
  name: 'AlertresourceList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin],
  props: {
    listId: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.listId,
        resource: 'alertresources',
        apiVersion: 'v1',
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter('alertresource'),
          tenant: getTenantFilter(),
        },
      }),
    }
  },
  created () {
    this.fetchData()
  },
  methods: {
    setNavbarAlert (data) {
      if (this.$appConfig.isPrivate) {
        this.$store.commit('app/SET_ALERTRESOURCE', data)
      }
    },
    async fetchData () {
      try {
        const data = await this.list.fetchData()
        this.setNavbarAlert(data)
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
