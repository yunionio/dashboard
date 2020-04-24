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
  getRegionTableColumn,
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
        getRegionTableColumn(),
      ],
      groupActions: [
        {
          label: '新建',
          permission: 'lb_loadbalancercluster_create',
          action: () => {
            this.createDialog('LoadbalancerclusterCreateDialog', {
              title: '新建',
              data: this.list.selectedItems,
              list: this.list,
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
      singleActions: [
        {
          label: '删除',
          permission: 'lb_loadbalancercertificates_delete',
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
          meta: (obj) => {
            if (!obj.can_delete) {
              return {
                validate: false,
                tooltip: '无法删除，请确认负载均衡实例已经迁移至其它集群',
              }
            }
            return {
              validate: true,
              tooltip: '',
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
  },
}
</script>
