
<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { getNameFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'K8SFederatednamespaceList',
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
        resource: 'federatednamespaces',
        apiVersion: 'v1',
        getParams: this.getParams,
        filterOptions: {
          name: getNameFilter(),
        },
      }),
      groupActions: [
        {
          label: this.$t('k8s.create'),
          permission: 'k8s_federatednamespaces_create',
          action: () => {
            this.$router.push({ path: '/k8s-federatednamespace/create' })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: this.$t('k8s.text_201'),
          permission: 'k8s_federatednamespaces_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('k8s.text_284'),
              name: this.$t('k8s.text_23'),
              onManager: this.onManager,
              requestParams: {
                id: this.list.selectedItems.map(item => item.id),
              },
            })
          },
          meta: () => this.$getDeleteResult(this.list.selectedItems),
        },
      ],
    }
  },
  created () {
    this.fetchData()
  },
  methods: {
    fetchData () {
      this.list.fetchData()
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'K8SFederatednamespaceSidePage', {
        id: row.id,
        resource: 'federatednamespaces',
        apiVersion: 'v1',
        getParams: this.list.getParams,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
