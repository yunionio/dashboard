<template>
  <div style="margin-bottom: 20px">
    <vxe-grid
      :columns="tableColumn"
      :data="rdsList"
      :loading="loading"
      @radio-change="handleRdsChange"
      max-height="300"
      ref="tableRef">
      <template v-slot:empty>
        <page-list-empty :loading="loading" />
      </template>
    </vxe-grid>
  </div>
</template>
<script>
import { sizestr } from '@/utils/utils'
import PageListEmpty from '@/components/PageList/Loader'

export default {
  name: 'BackupRecoveryRdsList',
  inject: ['form'],
  components: {
    PageListEmpty,
  },
  props: ['backupItem'],
  data () {
    return {
      loading: false,
      rdsList: [],
    }
  },
  computed: {
    tableColumn () {
      const column = [
        { type: 'radio', width: 40 },
        { field: 'name', title: '实例名称' },
        {
          title: '配置',
          slots: {
            default: ({ row }) => {
              return `${row.vcpu_count}核 ${sizestr(row.vmem_size_mb, 'M', 1024)}`
            },
          },
        },
        {
          title: '数据库类型',
          render: (row) => {
            return row.engine
          },
        },
      ]
      return column
    },
  },
  created () {
    // this.form.getFieldDecorator('sku', { preserve: true })
    this.fetchQueryRDSList()
  },
  methods: {
    handleRdsChange (id) {
      console.log(id)
    },
    async fetchQueryRDSList () {
      // eslint-disable-next-line camelcase
      const { provider, engine, cloudregion_id, engine_version } = this.backupItem
      const params = {
        scope: this.$store.getters.scope,
        limit: 0,
        status: 'running',
        provider,
        engine,
        cloudregion_id,
        engine_version,
      }
      this.loading = true
      try {
        const { data } = await new this.$Manager('dbinstances', 'v2').list({ params })
        this.rdsList = data.data
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
