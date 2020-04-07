
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
import ClusterNamespace from '@K8S/sections/ClusterNamespace'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { getNameFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'K8SNodeList',
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
        resource: 'storageclasses',
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
          permission: 'k8s_kubeclusters_create',
          action: () => {
            this.$router.push({ path: '/k8s-storageclass/create' })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: '删除',
          permission: 'k8s_storageclasses_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: '删除存储类',
              name: '存储类',
              onManager: this.onManager,
            })
          },
          meta: () => ({
            validate: this.list.selectedItems.length > 0,
          }),
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
      this.sidePageTriggerHandle(this, 'K8SStorageclassSidePage', {
        id: row.name,
        resource: 'storageclasses',
        apiVersion: 'v1',
        getParams: this.list.getParams,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
