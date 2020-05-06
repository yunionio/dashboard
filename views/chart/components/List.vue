<template>
  <page-card-list
    :list="list"
    :single-actions="singleActions"
    :card-fields="cardFields">
    <template #group-actions-append>
      <search-box class="ml-3" :options="options" :value="searchValue" @input="search" placeholder="请输入您要应用的名称" />
    </template>
  </page-card-list>
</template>

<script>
import * as R from 'ramda'
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
      searchValue: {},
      options: {
        name: {
          label: '名称',
        },
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
    this.fetchData()
  },
  methods: {
    fetchData () {
      this.list.fetchData()
    },
    search (val) {
      this.searchValue = val
      if (R.isEmpty(val)) {
        const params = R.clone(this.list.getParams)
        delete params.keyword
        this.list.getParams = params
        this.fetchData()
        return
      }
      this.list.getParams = { ...this.list.getParams, keyword: val.name[0] }
      this.fetchData()
    },
  },
}
</script>
