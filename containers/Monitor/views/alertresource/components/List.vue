
<template>
  <page-list
    :list="list"
    :columns="columns"
    ref="pagelist"
    @refresh="setNavbarAlert"
    :single-actions="singleActions"
    :expandConfig="expandConfig" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter, getDescriptionFilter } from '@/utils/common/tableFilter'

export default {
  name: 'AlertresourceList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
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
          description: getDescriptionFilter(),
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
