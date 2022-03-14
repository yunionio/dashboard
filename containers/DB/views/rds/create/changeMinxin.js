export default {
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
    cloudregion_change () {
      this.skuRef.fetchCapability()
    },
    // 获取CPU核数、内存、可用区
    capability_change () {
      this.skuRef.fetchSpecs()
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
      this.form.fd = {
        ...this.form.fd,
        ...changedFields,
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
    },
  },
}
