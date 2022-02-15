import { getInitialValue } from '@/utils/common/ant'
import { SKU_PARAMS, CAPABILIT_PARAMS, DECORATORS } from '../constants'

export default {
  computed: {
    form () {
      const fc = this.$form.createForm(this, { onValuesChange: this.handleValuesChange })
      const initFd = getInitialValue(DECORATORS)
      const { getFieldDecorator, getFieldValue, getFieldsValue, setFieldsValue } = fc
      return {
        fc,
        fd: initFd,
        getFieldDecorator,
        getFieldValue,
        getFieldsValue,
        setFieldsValue,
      }
    },
  },
  provide () {
    return {
      form: this.form,
      scopeParams: this.scopeParams,
      formItemLayout: this.formItemLayout,
      tailFormItemLayout: this.tailFormItemLayout,
    }
  },
  async created () {
    // 当前选中的sku内部的 cloudregion_id
    this.form.fc.getFieldDecorator('cloudregion_id', { preserve: true })

    this.keysChange = {
      area: CAPABILIT_PARAMS,
      sku_params: SKU_PARAMS,
    }
    await this.$nextTick()
    this.skuRef = this.$refs.REF_SKU
    this.networkRef = this.$refs.REF_NETWORK
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
    billing_type_change () {
      this.skuRef.fetchSkus()
    },
    area_change () {
      this.skuRef.fetchSkus()
    },
    // 获取sku
    sku_params_change () {
      this.skuRef.fetchSkus()
    },
    sku_change () {
      const { fd } = this.form
      const { sku } = fd
      if (sku && (fd.cloudregion_id !== sku.cloudregion_id)) {
        this.form.fc.setFieldsValue({
          cloudregion_id: sku.cloudregion_id,
        })
      }
    },
    cloudregion_id_change () {
      if (this.networkRef && this.networkRef.fetchVpc) {
        this.fetchVpc()
      }
    },
    async handleValuesChange (fc, changedFields) {
      this.form.fd = {
        ...this.form.fd,
        ...changedFields,
      }
      await this.$nextTick()
      const changedFieldsKey = Object.keys(changedFields)
      changedFieldsKey.forEach(field => {
        // if (changedFields[field] === undefined) return false

        const handleChange = this[`${field}_change`]
        if (this[`${field}_change`]) {
          return handleChange()
        }

        for (const k in this.keysChange) {
          if (this.keysChange[k].indexOf(field) > -1 && this[`${k}_change`]) {
            this[`${k}_change`]()
          }
        }
      })
    },
  },
}
