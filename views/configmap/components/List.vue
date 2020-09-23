
<template>
  <page-list
    :list="list"
    :columns="columns"
    :noDataText="noDataText"
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
import ClusterNamespace from '@K8S/sections/ClusterNamespace'
import releaseMixin from '@K8S/mixins/releaseSidepage'
import clusterNamespaceMixin from '@K8S/mixins/clusterNamespace'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'K8SConfigmapList',
  components: {
    ClusterNamespace,
  },
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
        resource: 'configmaps',
        apiVersion: 'v1',
        getParams: this.getParams,
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
          label: this.$t('k8s.text_49'),
          permission: 'k8s_configmaps_create',
          action: () => {
            this.$router.push({ path: '/k8s-configmap/create' })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: this.$t('k8s.text_201'),
          permission: 'k8s_configmaps_delete',
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
              title: this.$t('k8s.text_201'),
              name: this.$t('k8s.text_17'),
              onManager: this.onManager,
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
                tooltip = this.$t('k8s.text_203')
              }
            } else {
              validate = false
              tooltip = this.$t('k8s.text_204')
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
      this.sidePageTriggerHandle(this, 'K8SConfigmapSidePage', {
        id: row.id,
        resource: 'configmaps',
        getParams: () => {
          const params = R.clone(this.list.getParams)
          if (row.namespace) {
            params.namespace = row.namespace
            if (params.all_namespace) delete params.all_namespace
          }
          return params
        },
        apiVersion: 'v1',
      }, {
        list: this.list,
      })
    },
  },
}
</script>
