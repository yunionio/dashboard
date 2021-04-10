
<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions" />
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { getNameFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import ListMixin from '@/mixins/list'

export default {
  name: 'KubeclusterList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'kubeclusters',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions: {
          name: getNameFilter(),
        },
        steadyStatus: {
          status: Object.values(expectStatus.kubecluster).flat(),
          sync_status: Object.values(expectStatus.kubecluster_sync_status).flat(),
        },
      }),
      groupActions: [
        {
          label: this.$t('k8s.text_49'),
          permission: 'k8s_kubeclusters_create',
          action: () => {
            this.$router.push({ path: '/k8s-cluster/create' })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: this.$t('k8s.text_143'),
          permission: 'k8s_kubeclusters_create',
          action: () => {
            this.$router.push({ path: '/k8s-cluster/import' })
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('kube-machine-list')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = { ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams) }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'K8SClusterSidePage', {
        id: row.id,
        resource: 'kubeclusters',
        apiVersion: 'v1',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
