
<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions">
    <template v-slot:group-actions-append>
      <cluster-namespace :getParams.sync="list.getParams" :ignoreNamespace="true" @refresh="fetchData" class="ml-3" />
    </template>
    </page-list>
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ClusterNamespace from '@K8S/sections/ClusterNamespace'
import { getNameFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'K8SNamespaceList',
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
        resource: 'namespaces',
        apiVersion: 'v1',
        getParams: this.getParams,
        filterOptions: {
          name: getNameFilter(),
        },
      }),
      groupActions: [
        {
          label: this.$t('k8s.text_49'),
          permission: 'k8s_namespaces_create',
          action: () => {
            this.$router.push({ path: '/k8s-namespace/create' })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: this.$t('k8s.text_201'),
          permission: 'k8s_namespaces_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('k8s.text_284'),
              name: this.$t('k8s.text_23'),
              onManager: this.onManager,
              requestData: {
                cluster: this.list.selectedItems[0].clusterID,
              },
              requestParams: {
                id: this.list.selectedItems.map(item => item.id),
              },
            })
          },
          meta: () => {
            if (this.list.selectedItems.length > 0) {
              const namespaces = this.list.selectedItems.map(v => v.namespace)
              const unique = Array.from(new Set(namespaces))
              if (unique.length > 1) {
                return {
                  validate: false,
                  tooltip: this.$t('k8s.text_203'),
                }
              }
              return {
                validate: true,
                tooltip: '',
              }
            } else {
              return {
                validate: false,
                tooltip: this.$t('k8s.text_204'),
              }
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
        this.list.fetchData()
      }
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'K8SNamespaceSidePage', {
        id: row.id,
        resource: 'namespaces',
        apiVersion: 'v1',
        getParams: this.list.getParams,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
