
<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions">
    <template v-slot:group-actions-append>
      <cluster-namespace :getParams.sync="list.getParams" :ignoreNamespace="true" @refresh="fetchData" class="ml-3" />
    </template>
    </page-list>
</template>

<script>
import ClusterNamespace from '@K8S/sections/ClusterNamespace'
import { getNameFilter, getStatusFilter, getDomainFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'K8SNodeList',
  components: {
    ClusterNamespace,
  },
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    const filter = {}
    if (this.$route.query.status) {
      filter.status = [this.$route.query.status]
    }
    if (this.$route.query.domain) {
      filter.domain = [this.$route.query.domain]
    }
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'k8s_nodes',
        apiVersion: 'v1',
        getParams: this.getParams,
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter({ statusMoule: 'kubecluster' }),
          domain: getDomainFilter(),
        },
        filter,
      }),
    }
  },
  created () {
    this.fetchData()
  },
  methods: {
    fetchData () {
      if (this.list.getParams.cluster) {
        this.list.fetchData()
      }
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'K8SNodeSidePage', {
        id: row.id,
        resource: 'k8s_nodes',
        apiVersion: 'v1',
        getParams: this.list.getParams,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
