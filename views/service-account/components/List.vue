
<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions">
    <template v-slot:group-actions-append>
      <cluster-namespace :getParams.sync="list.getParams" @refresh="fetchData" class="ml-3" />
    </template>
  </page-list>
</template>

<script>
import ClusterNamespace from '@K8S/sections/ClusterNamespace'
import clusterNamespaceMixin from '@K8S/mixins/clusterNamespace'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { getNameFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'K8sServiceAccountList',
  components: {
    ClusterNamespace,
  },
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin, clusterNamespaceMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    showSearchbox: {
      type: Boolean,
      default: true,
    },
    showGroupActions: {
      type: Boolean,
      default: true,
    },
    responseData: {
      type: Object,
      validator: val => val.data,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'serviceaccounts',
        apiVersion: 'v1',
        getParams: this.getParams,
        idKey: 'name',
        filterOptions: {
          name: getNameFilter(),
        },
        responseData: this.responseData,
      }),
      groupActions: [
        {
          label: '删除',
          permission: 'k8s_rbacroles_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: '删除角色',
              name: '角色',
              onManager: this.onManager,
              idKey: 'name',
              ok: (ids, data) => {
                return new this.$Manager(`${data[0]['type']}s`, 'v1').batchDelete({
                  ids,
                  data: {
                    cluster: data[0].clusterID,
                    namespace: data[0].namespace,
                  },
                }).then(() => {
                  this.refresh()
                  return true
                }).catch(error => {
                  throw error
                })
              },
            })
          },
          meta: () => {
            if (this.list.selectedItems.length > 0) {
              let namespaces = this.list.selectedItems.map(v => v.namespace)
              let unique = Array.from(new Set(namespaces))
              if (unique.length > 1) {
                return {
                  validate: false,
                  tooltip: '请选择同一个命名空间下的资源',
                }
              }
              return {
                validate: true,
                tooltip: '',
              }
            } else {
              return {
                validate: false,
                tooltip: '请选择需要删除的资源，且为同一命名空间下的资源',
              }
            }
          },
        },
      ],
    }
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'K8SServiceAccountSidePage', {
        id: row.name,
        resource: 'serviceaccounts',
        apiVersion: 'v1',
        getParams: this.list.getParams,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
