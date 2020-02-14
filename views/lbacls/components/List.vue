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
  getTimeTableColumn,
  getProjectTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'LbaclsList',
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
        resource: 'loadbalanceracls',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: '策略组名称',
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
          title: '策略组名称',
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'LbaclSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'acl_entries',
          title: '源地址 | 备注',
          width: 150,
          type: 'expand',
          slots: {
            content: ({ row }, h) => {
              const arr = []
              row.acl_entries.forEach(obj => {
                let text = obj.cidr
                if (obj.comment) {
                  text += ` | ${obj.comment}`
                }
                arr.push({
                  value: text,
                })
              })
              const ret = []
              if (arr.length > 0) {
                ret.push(
                  <div class='mb-2'>
                    { arr.map(item => <a-tag>{ item.value }</a-tag>) }
                  </div>
                )
              }
              if (ret.length <= 0) {
                ret.push(
                  <div>暂无源地址 | 备注</div>
                )
              }
              return ret
            },
          },
        },
        getTimeTableColumn(),
        {
          field: 'updated_at',
          title: '更新时间',
          width: 150,
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
          },
        },
        getProjectTableColumn(),
      ],
      groupActions: [
        {
          label: '新建',
          permission: 'lb_loadbalanceracls_create',
          action: () => {
            this.createDialog('LbaclsCreateDialog', {
              title: '新建',
              data: this.list.selectedItems,
              list: this.list,
              type: 'create',
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: this.hasService(this.userInfo, 'lbagent') || this.hasHypervisors(['aliyun', 'qcloud', 'huawei', 'aws']),
            }
          },
        },
        {
          label: '删除',
          permission: 'lb_loadbalancerlisteners_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              title: '删除',
              data: this.list.selectedItems,
              columns: this.columns,
              list: this.list,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
      singleActions: [
        {
          label: '修改',
          permission: 'lb_loadbalanceracls_update',
          action: (obj) => {
            this.createDialog('LbaclsCreateDialog', {
              title: '修改',
              data: [obj],
              columns: this.columns,
              list: this.list,
              type: 'update',
            })
          },
        },
        {
          label: '删除',
          permission: 'lb_loadbalancerlisteners_delete',
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
          meta: (obj) => this.$getDeleteResult(obj),
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  created () {
    this.initSidePageTab('lbacl-detail')
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
