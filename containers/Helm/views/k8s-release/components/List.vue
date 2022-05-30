
<template>
  <page-list
    :list="list"
    :columns="columns"
    :noDataText="noDataText"
    :group-actions="groupActions"
    :single-actions="singleActions">
    <template v-slot:group-actions-append>
      <cluster-namespace :getParams.sync="list.getParams" @refresh="fetchData" class="ml-3" />
    </template>
  </page-list>
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ClusterNamespace from '@K8S/sections/ClusterNamespace'
import clusterNamespaceMixin from '@K8S/mixins/clusterNamespace'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getCreatedAtFilter } from '@/utils/common/tableFilter'

export default {
  name: 'K8SReleaseList',
  components: {
    ClusterNamespace,
  },
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin, clusterNamespaceMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({ type: 'external' }),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'releases',
        apiVersion: 'v1',
        getParams: this.getParams,
        filterOptions: {
          name: {
            label: this.$t('helm.text_16'),
          },
          created_at: getCreatedAtFilter(),
        },
        steadyStatus: {
          status: Object.values(expectStatus.release).flat(),
        },
        itemGetParams: {
          cluster: '',
          namespace: '',
        },
      }),
      groupActions: [
        {
          label: this.$t('helm.text_68'),
          permission: 'k8s_releases_create',
          action: () => {
            this.$router.push({
              path: '/k8s-chart',
              query: {
                type: 'external',
              },
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: this.$t('helm.text_69'),
          permission: 'k8s_releases_delete',
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
              title: this.$t('helm.text_69'),
              name: this.$t('helm.text_4'),
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
                tooltip = this.$t('helm.text_70')
              }
            } else {
              validate = false
              tooltip = this.$t('helm.text_71')
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
      this.sidePageTriggerHandle(this, 'K8SReleaseSidePage', {
        id: row.id,
        resource: 'releases',
        getParams: () => {
          const params = R.clone(this.list.getParams)
          if (row.namespace) {
            params.namespace = row.namespace
            if (params.all_namespace) delete params.all_namespace
          }
          return params
        },
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
