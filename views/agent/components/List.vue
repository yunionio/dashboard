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
import {
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'LoadbalancerclusterList',
  mixins: [WindowsMixin],
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
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          title: '名称',
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'LoadbalancerclusterSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'cluster',
          title: '集群',
          width: 70,
        },
        {
          field: 'ha_state',
          title: '主备',
          width: 70,
        },
        {
          field: 'ip',
          title: 'IP',
          width: 100,
        },
        {
          field: 'hb_last_seen',
          title: '上一次心跳',
          width: 100,
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).fromNow()
          },
        },
        {
          field: 'zone',
          title: '可用区',
          width: 70,
        },
        {
          field: 'version',
          title: '软件版本',
          width: 250,
        },
      ],
      groupActions: [
        {
          label: '新建',
          permission: 'lb_loadbalancers_create',
          action: () => {
            this.createDialog('', {
              title: '新建',
              data: this.list.selectedItems,
              list: this.list,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
      ],
      singleActions: [
        {
          label: '部署',
          action: (obj) => {
            this.createDialog('AgentDeployDialog', {
              title: '部署',
              data: [obj],
              columns: this.columns,
              list: this.list,
            })
          },
        },
        {
          label: '下线',
          action: (obj) => {
            this.createDialog('', {
              title: '下线',
              data: [obj],
              columns: this.columns,
              list: this.list,
            })
          },
          meta: (obj) => {
            if (!obj.deployment && !obj.deployment.host) {
              return {
                validate: false,
              }
            }
            return {
              validate: true,
            }
          },
        },
        {
          label: '删除',
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              title: '删除',
              data: [obj],
              columns: this.columns,
              list: this.list,
              success: () => {
                this.destroySidePages()
              },
            })
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
  },
}
</script>
