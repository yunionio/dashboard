
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
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getCreatedAtFilter } from '@/utils/common/tableFilter'

export default {
  name: 'VmReleaseList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({ type: 'internal' }),
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
                type: 'internal',
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
            this.createDialog('DeleteResDialog', {
              vm: this,
              data,
              columns: this.columns,
              title: this.$t('helm.text_69'),
              name: this.$t('helm.text_3'),
              onManager: this.onManager,
            })
          },
          meta: () => this.$getDeleteResult(this.list.selectedItems),
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'VmReleaseSidePage', {
        id: row.id,
        resource: 'releases',
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
