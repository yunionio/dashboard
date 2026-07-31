export default {
  data () {
    return {
      provider: '',
    }
  },
  async created () {
    const capability = ['engine', 'engine_version', 'category', 'storage_type']
    const specs = ['vcpu_count', 'vmem_size_mb', 'zones']
    this.keysChange = {
      capability,
      specs,
    }
    await this.$nextTick()
    this.skuRef = this.$refs.SKU
    this.networkRef = this.$refs.NETWORK
  },
  methods: {
    domain_change () {
      if (this.$store.getters.isAdminMode) {
        const { domain } = this.form.fd
        this.scopeParams.project_domain = domain || this.form.getFieldValue('domain')
        delete this.scopeParams.scope
      } else {
        delete this.scopeParams.project_domain
      }
    },
    // 获取CPU核数、内存、可用区
    capability_change () {
      // 级联回填/切换引擎过程中由 Filters @change 统一拉，避免半成品参数把 CPU 清空
      if (this._rdsSkuDraftRestoring) return
      if (this.skuRef && this.skuRef.ensureFetchSpecs) {
        this.skuRef.ensureFetchSpecs(0)
      }
    },
    cloudregion_change () {
      // capability 拉完后 Filters 会 emit change → ensureFetchSpecs；这里只触发引擎级联
      if (this.skuRef && this.skuRef.fetchCapability) {
        this.skuRef.fetchCapability()
      }
    },
    // 获取skulist
    specs_change () {
      this.skuRef.fetchSkus()
    },
    zones_change () {
      this.skuRef.fetchSkus()
      this.networkRef.fetchVpc()
    },
    provider_change () {
      const { provider } = this.form.fd
      if (provider && provider === 'Aws') {
        this.networkRef.fetchVpc()
      }
    },
    async handleValuesChange (fc, changedFields) {
      const fields = Object.keys(changedFields)
      if (changedFields && fields.length > 0) {
        fields.forEach(field => {
          this.$set(this.form.fd, field, changedFields[field])
          if (field === 'vpc') {
            this.vpc = changedFields[field]
          }
        })
      }
      if (changedFields.hasOwnProperty('provider')) {
        this.provider = changedFields.provider
      }
      await this.$nextTick()
      Object.keys(changedFields).forEach(field => {
        if (changedFields[field] === undefined) return false
        let _field = field
        if (this[`${_field}_change`] === undefined) {
          for (const k in this.keysChange) {
            if (this.keysChange[k].indexOf(_field) > -1) {
              _field = k
            }
          }
        }
        const handleChange = this[`${_field}_change`]
        if (this[`${_field}_change`]) {
          return handleChange()
        }
      })
      if (typeof this.syncCreateFormFcDrafts === 'function') {
        this.syncCreateFormFcDrafts(changedFields)
      }
    },
  },
}
