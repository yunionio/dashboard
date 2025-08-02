
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
import { getNameFilter, getCreatedAtFilter, getProjectDomainFilter, getStatusFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import ListMixin from '@/mixins/list'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

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
    const filter = {}
    if (this.$route.query.domain) {
      filter.domain = [this.$route.query.domain]
    }
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'kubeclusters',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: getNameFilter(),
          mode: {
            label: this.$t('k8s.text_186'),
            items: [
              { label: this.$t('k8s.text_187'), key: 'customize' },
              { label: this.$t('k8s.text_143'), key: 'import' },
            ],
            dropdown: true,
          },
          status: getStatusFilter({ statusModule: 'kubecluster' }),
          project_domain: getProjectDomainFilter(),
          created_at: getCreatedAtFilter(),
        },
        filter,
        steadyStatus: {
          status: Object.values(expectStatus.kubecluster).flat(),
          sync_status: Object.values(expectStatus.kubecluster_sync_status).flat(),
        },
        hiddenColumns: ['created_at'],
      }),
      groupActions: [
        {
          label: this.$t('k8s.create'),
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
    handleOpenSidepage (row, tab) {
      if (tab) {
        this.initSidePageTab(tab)
      }
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
