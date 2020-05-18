
<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions">
    <template v-slot:group-actions-append>
      <cluster-namespace :getParams.sync="list.getParams" :namespaceMap="namespaceMap" @refresh="fetchData" class="ml-3" />
    </template>
  </page-list>
</template>

<script>
import * as R from 'ramda'
import ClusterNamespace from '@K8S/sections/ClusterNamespace'
import clusterNamespaceMixin from '@K8S/mixins/clusterNamespace'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter } from '@/utils/common/tableFilter'

export default {
  name: 'K8SServiceList',
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
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'k8s_services',
        apiVersion: 'v1',
        getParams: this.getParams,
        idKey: 'name',
        filterOptions: {
          name: getNameFilter(),
        },
      }),
      groupActions: [
        {
          label: '新建',
          permission: 'k8s_services_create',
          action: () => {
            this.$router.push({ path: '/k8s-service/create' })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: '删除',
          permission: 'k8s_services_delete',
          action: () => {
            const data = this.list.selectedItems
            const requestData = {
              cluster: data[0].clusterID,
            }
            const namespace = data[0].namespace
            if (namespace) requestData.namespace = namespace
            this.createDialog('DeleteResDialog', {
              vm: this,
              data,
              columns: this.columns,
              title: '删除',
              name: '服务',
              onManager: this.onManager,
              idKey: 'name',
              requestData,
            })
          },
          meta: () => {
            let validate = true
            let tooltip = ''
            if (this.list.selectedItems.length > 0) {
              let namespaces = this.list.selectedItems.map(v => v.namespace)
              let unique = Array.from(new Set(namespaces))
              if (unique.length > 1) {
                validate = false
                tooltip = '请选择同一个命名空间下的资源'
              }
            } else {
              validate = false
              tooltip = '请选择需要删除的资源，且为同一命名空间下的资源'
            }
            return {
              validate,
              tooltip,
            }
          },
        },
      ],
    }
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'K8SServiceSidePage', {
        id: row.name,
        resource: 'k8s_services',
        getParams: () => {
          const params = R.clone(this.list.getParams)
          if (row.namespace) {
            params.namespace = row.namespace
            if (params.all_namespace) delete params.all_namespace
          }
          return params
        },
        idKey: 'name',
        apiVersion: 'v1',
      }, {
        list: this.list,
      })
    },
  },
}
</script>
