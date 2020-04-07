
<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions">
    <template v-slot:group-actions-append>
      <cluster-namespace :getParams.sync="list.getParams" @refresh="fetchData" class="ml-3" />
    </template>
  </page-list>
</template>

<script>
import ClusterNamespace from '@K8S/sections/ClusterNamespace'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'K8SPodList',
  components: {
    ClusterNamespace,
  },
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
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
        resource: 'pods',
        apiVersion: 'v1',
        getParams: this.getParams,
        idKey: 'name',
        filterOptions: {
          name: {
            label: '名称',
          },
        },
        steadyStatus: {
          status: Object.values(expectStatus.k8s_resource).flat(),
        },
      }),
      groupActions: [
        {
          label: '删除',
          permission: 'k8s_pods_delete',
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
              onManager: this.onManager,
              idKey: 'name',
              requestData,
            })
          },
          meta: () => {
            let validate = true
            let tooltip = ''
            if (this.list.selectedItems.length > 0) {
              let namespaces = this.pagedata.selectedItems.map(v => v.namespace)
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
  created () {
    this.fetchData()
  },
  methods: {
    fetchData () {
      if (this.list.getParams.cluster) {
        if (this.list.getParams.all_namespace || this.list.getParams.namespace) {
          this.list.fetchData()
        }
      }
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'K8SPodSidePage', {
        id: row.name,
        resource: 'pods',
        getParams: this.list.getParams,
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
