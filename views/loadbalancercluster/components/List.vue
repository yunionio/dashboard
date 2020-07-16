<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'LoadbalancerclusterList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
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
        resource: 'loadbalancerclusters',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '区域', key: 'region' },
        ],
      },
      groupActions: [
        {
          label: '新建',
          permission: 'lb_loadbalancercluster_create',
          action: () => {
            this.createDialog('LoadbalancerclusterCreateDialog', {
              title: '新建集群',
              data: this.list.selectedItems,
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: this.$isAdminMode,
            }
          },
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode']),
  },
  created () {
    this.initSidePageTab('Loadbalancercluster-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      return ret
    },
    hasService ($userInfo, service) {
      if ($userInfo && $userInfo.services && $userInfo.services.length) {
        const results = $userInfo.services.filter(item => {
          return item.type === service && item.status === true
        })
        return results && results.length > 0
      }
      return false
    },
    hasHypervisors (hypervisors) {
      for (let i = 0, len = hypervisors.length; i < len; i++) {
        if ((this.userInfo.hypervisors || []).indexOf(hypervisors[i]) !== -1) {
          return true
        }
      }
      return false
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'LoadbalancerclusterSidePage', {
        id: row.id,
        resource: 'loadbalancerclusters',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
