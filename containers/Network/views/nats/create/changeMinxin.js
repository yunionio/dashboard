import * as R from 'ramda'
import { getInitialValue } from '@/utils/common/ant'
import { CAPABILIT_PARAMS, DECORATORS } from '../constants'

export default {
  data () {
    const fc = this.$form.createForm(this, {
      onValuesChange: (props, values) => {
        if (typeof this.handleValuesChange === 'function') {
          this.handleValuesChange(props, values)
        }
      },
    })
    const initFd = getInitialValue(DECORATORS)
    return {
      form: {
        fc,
        fd: initFd,
        getFieldDecorator: (...args) => fc.getFieldDecorator(...args),
        getFieldValue: (...args) => fc.getFieldValue(...args),
        getFieldsValue: (...args) => fc.getFieldsValue(...args),
        setFieldsValue: (...args) => fc.setFieldsValue(...args),
      },
    }
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
    }
    await this.$nextTick()
    this.skuRef = this.$refs.REF_SKU
    this.networkRef = this.$refs.REF_NETWORK
  },
  methods: {
    domain_change () {
      if (this.$store.getters.isAdminMode) {
        const { domain } = this.form.fd
        this.scopeParams.project_domain = domain || this.form.getFieldValue('domain') || this.project_domain
        delete this.scopeParams.scope
      } else {
        delete this.scopeParams.project_domain
        this.scopeParams.scope = this.scope
      }
    },
    billing_type_change () {
      this.refreshSkuByAreaSelection()
    },
    area_change () {
      this.refreshSkuByAreaSelection()
    },
    sku_change () {
      const sku = this.form.fd.sku || this.form.fc.getFieldValue('sku')
      if (R.is(Object, sku) && sku.cloudregion_id) {
        if (this.form.fd.cloudregion_id !== sku.cloudregion_id) {
          this.form.fc.setFieldsValue({
            cloudregion_id: sku.cloudregion_id,
          })
          this.$set(this.form.fd, 'cloudregion_id', sku.cloudregion_id)
        }
        this.$nextTick(() => {
          this.fetchVpc()
        })
      }
    },
    cloudregion_id_change () {
      if (this.networkRef && this.networkRef.fetchVpc) {
        this.fetchVpc()
      }
    },
    async handleValuesChange (fc, changedFields) {
      Object.keys(changedFields).forEach(field => {
        this.$set(this.form.fd, field, changedFields[field])
      })
      await this.$nextTick()
      const changedFieldsKey = Object.keys(changedFields)
      for (const field of changedFieldsKey) {
        // 清空 sku 时不走 sku_change，避免无效联动
        if (field === 'sku' && changedFields[field] === undefined) continue
        const handleChange = this[`${field}_change`]
        if (handleChange) {
          await handleChange()
          continue
        }
        for (const k in this.keysChange) {
          if (this.keysChange[k].indexOf(field) > -1 && this[`${k}_change`]) {
            await this[`${k}_change`]()
          }
        }
      }
    },
  },
}
