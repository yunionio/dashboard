<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions" />
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
        },
      }),
      groupActions: [
        {
          label: '新建',
          permission: 'lb_loadbalancers_create',
          action: () => {
            this.$router.push({ name: 'AgentCreate' })
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
