<template>
  <page-card-list
    :list="list"
    :single-actions="singleActions"
    :card-fields="cardFields">
    <template #group-actions-append>
      <div class="d-flex align-items-center ml-3">
        <span class="chart-form-label">类型：</span>
        <base-select
          v-model="type"
          :options="typeOpts"
          isDefaultSelect
          :select-props="{ placeholder: '请选择' }" />
        <span class="chart-form-labe ml-3">仓库：</span>
        <base-select
          version="v1"
          v-model="repo"
          resource="repos"
          idKey="name"
          :params="repoParams"
          isDefaultSelect
          :select-props="{ placeholder: '请选择' }" />
      </div>
    </template>
    <template #tool-actions-between>
      <a-button @click="toRepo" type="link" size="small">仓库管理</a-button>
    </template>
    <template #tool-actions-append>
      <search-box :options="options" :value="searchValue" @input="search" placeholder="请输入您要应用的名称" />
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
        apiVersion: 'v1',
        idKey: 'name',
      }),
      cardFields: {
        url: 'chart.icon',
        title: 'name',
        desc: 'chart.description',
        description: row => {
          if (row.type === 'internal') return '虚拟机类型'
          if (row.type === 'external') return '容器类型'
          return '-'
        },
      },
      searchValue: {},
      repo: undefined,
      type: this.$route.query.type || 'internal',
      typeOpts: [
        { key: 'internal', label: '虚拟机类型' },
        { key: 'external', label: '容器类型' },
      ],
      options: {
        name: {
          label: '名称',
        },
        // type: {
        //   label: '类型',
        //   multiple: true,
        //   dropdown: true,
        //   filter: true,
        //   item: [
        //     { key: 'internal', label: `${this.$t('dictionary.server')}应用` },
        //     { key: 'external', label: `${this.$t('dictionary.server')}应用` },
        //   ]
        // }
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
          // permission: 'k8s_charts_create',
          action: (obj) => {
            this.$router.push({
              path: '/k8s-chart/create',
              query: {
                repo: obj.repo,
                name: obj.name,
                type: obj.type,
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
    repoParams () {
      return {
        limit: 0,
        scope: this.$store.getters.scope,
        type: this.type,
      }
    },
  },
  watch: {
    repo (val) {
      this.repoChange(val)
    },
  },
  methods: {
    repoChange (val) {
      if (val) {
        this.list.getParams = { ...this.list.getParams, repo: val }
      } else {
        const params = R.clone(this.list.getParams)
        delete params.repo
      }
      this.fetchData()
    },
    fetchData () {
      if (!this.list.getParams.repo) return
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
    toRepo () {
      this.$router.push('/k8s-repo')
    },
  },
}
</script>

<style lang="less" scoped>
.chart-form-label {
  color: rgba(0, 0, 0, 0.85);
}
</style>
