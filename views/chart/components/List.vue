<template>
  <page-card-list
    :list="list"
    :single-actions="singleActions"
    :card-fields="cardFields" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import { getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import ListMixin from '@/mixins/list'

export default {
  name: 'K8SChartPageList',
  mixins: [WindowsMixin, ListMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'charts',
        getParams: this.getParams,
        apiVersion: 'v1',
        idKey: 'name',
      }),
      cardFields: {
        url: 'chart.icon',
        title: 'name',
        desc: 'chart.description',
      },
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
        }),
        {
          field: 'created_at',
          title: '创建时间',
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
          },
        },
      ],
      singleActions: [
        {
          label: '部署',
          permission: 'k8s_charts_create',
          action: (obj) => {
            this.$router.push({
              path: '/k8s-chart/create',
              query: {
                repo: obj.repo,
                name: obj.name,
              },
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
      ],
    }
  },
  computed: {
    getParams () {
      return {}
    },
  },
  created () {
    this.list.fetchData()
  },
  methods: {
  },
}
</script>
