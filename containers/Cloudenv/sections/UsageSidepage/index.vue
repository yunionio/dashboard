<template>
  <div>
    <loading-block v-if="loading" />
    <detail
      v-else
      :data="data"
      :base-info="baseInfo"
      :on-manager="onManager"
      :showDesc="false"
      :hiddenKeys="['id', 'name', 'status', 'project_domain', 'tenant', 'created_at', 'updated_at']" />
  </div>
</template>

<script>
import * as R from 'ramda'
import { USAGE_CONFIG } from './constants'

export default {
  name: 'CloudenvUsageSidepage',
  props: {
    onManager: {
      type: Function,
      required: true,
    },
    resId: {
      type: String,
      required: true,
    },
    resource: {
      type: String,
      required: true,
    },
  },
  data () {
    const isAdminMode = this.$store.getters.isAdminMode
    const isDomainMode = this.$store.getters.isDomainMode
    const baseInfo = []
    Object.keys(USAGE_CONFIG).forEach((key) => {
      const item = USAGE_CONFIG[key] || {}
      if (!item.noPerfix) {
        if (isAdminMode) key = `all.${key}`
        if (isDomainMode) key = `domain.${key}`
      }
      baseInfo.push({
        field: key,
        title: item.zh_cn || key,
        formatter: ({ row }) => {
          return R.is(Function, item.formatter) ? item.formatter(row[key]) : `${row[key] || 0} ${item.unit}`
        },
      })
    })
    return {
      data: {},
      loading: false,
      baseInfo,
    }
  },
  created () {
    this.fetchData()
  },
  methods: {
    async fetchData () {
      try {
        this.loading = true
        const params = { scope: this.$store.getters.scope }
        const { data } = await new this.$Manager('usages', 'v2').getSpecific({
          id: this.resource,
          spec: this.resId,
          params,
        })
        this.data = data
        this.loading = false
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
::v-deep .detail-item {
  .detail-item-title {
    width: 220px !important;
  }
  .detail-item-value {
    margin-left: 220px;
  }
}
</style>
