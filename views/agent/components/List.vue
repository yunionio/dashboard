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
  name: 'AgentList',
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
        resource: 'loadbalanceragents',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
          cluster: {
            label: '集群',
            dropdown: true,
            distinctField: {
              type: 'extra_field',
              key: 'cluster',
            },
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '集群', key: 'cluster' },
          { label: '主备', key: 'ha_state' },
          { label: 'IP', key: 'ip' },
          { label: '上一次心跳', key: 'hb_last_seen' },
          { label: '可用区', key: 'zone' },
          { label: '软件版本', key: 'version' },
        ],
      },
      groupActions: [
        {
          label: '新建',
          permission: 'lb_loadbalancers_create',
          action: () => {
            this.$router.push({
              name: 'AgentForm',
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
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
    this.initSidePageTab('agent-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'AgentSidePage', {
        id: row.id,
        resource: 'loadbalanceragents',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
