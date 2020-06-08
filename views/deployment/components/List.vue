
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
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import releaseMixin from '@K8S/mixins/releaseSidepage'
import clusterNamespaceMixin from '@K8S/mixins/clusterNamespace'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter } from '@/utils/common/tableFilter'

export default {
  name: 'K8SDeploymentList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin, clusterNamespaceMixin, releaseMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'deployments',
        apiVersion: 'v1',
        getParams: this.getParams,
        idKey: 'name',
        itemGetParams: {
          cluster: '',
          namespace: '',
        },
        filterOptions: {
          name: getNameFilter(),
        },
        steadyStatus: {
          status: Object.values(expectStatus.k8s_resource).flat(),
        },
        responseData: this.responseData,
      }),
      groupActions: [
        {
          label: '新建',
          permission: 'k8s_deployments_create',
          action: () => {
            this.$router.push({ path: '/k8s-deployment/create' })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: '删除',
          permission: 'k8s_deployments_delete',
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
              name: '无状态',
              onManager: this.onManager,
              idKey: 'name',
              requestData,
            })
          },
          meta: () => {
            let validate = true
            let tooltip = ''
            if (this.list.selectedItems.length > 0) {
              const namespaces = this.list.selectedItems.map(v => v.namespace)
              const unique = Array.from(new Set(namespaces))
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
      this.sidePageTriggerHandle(this, 'K8SDeploymentSidePage', {
        id: row.name,
        resource: 'deployments',
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
        steadyStatus: {
          status: Object.values(expectStatus.k8s_resource).flat(),
        },
      }, {
        list: this.list,
      })
    },
  },
}
</script>
