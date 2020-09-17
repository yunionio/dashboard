<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.dbinstances')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        class="mt-3"
        :form="form.fc">
        <s-k-u ref="SKU" :disableds="disableds" :rdsItem="rdsItem">
          <a-radio-group disabled slot="zone" :defaultValue="Object.keys(rdsZone)[0]">
            <a-radio-button :key="key" :value="key" v-for="(value, key) in rdsZone">{{value}}</a-radio-button>
          </a-radio-group>
        </s-k-u>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import SKU from '../create/components/SKU'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'RSDSetConfig',
  components: {
    SKU,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      formItemLayout: {
        wrapperCol: { span: 18 },
        labelCol: { span: 6 },
      },
      rdsZone: {},
    }
  },
  computed: {
    form () {
      const fc = this.$form.createForm(this, { onValuesChange: this.handleValuesChange })
      const { getFieldDecorator, getFieldValue, getFieldsValue, setFieldsValue } = fc
      return {
        fc,
        getFieldDecorator,
        getFieldValue,
        getFieldsValue,
        setFieldsValue,
      }
    },
    rdsItem () {
      const { data } = this.params
      return data[0]
    },
    disableds () {
      const _ = {
        Huawei: ['engine', 'engine_version', 'zones', 'category', 'storage_type'],
        Aliyun: ['engine', 'engine_version', 'zones'],
        Google: ['engine', 'engine_version', 'zones', 'category'],
      }
      return _[this.rdsItem.brand]
    },
    scopeParams () {
      if (this.$store.getters.isAdminMode) {
        return {
          project_domain: this.rdsItem.domain_id,
        }
      } else {
        return {
          scope: this.$store.getters.scope,
        }
      }
    },
  },
  provide () {
    return {
      form: this.form,
      formItemLayout: this.formItemLayout,
      scopeParams: this.scopeParams,
    }
  },
  async created () {
    this.form.fc.getFieldDecorator('provider', { preserve: true })
    this.form.fc.getFieldDecorator('zones', { preserve: true })
    this.form.fc.getFieldDecorator('cloudregion_id', { preserve: true })
    this.form.fc.getFieldDecorator('cloudregion', { preserve: true })
    const capability = ['engine', 'engine_version', 'category', 'storage_type']
    const specs = ['vcpu_count', 'vmem_size_mb', 'zones']
    this.keysChange = {
      capability,
      specs,
    }
    await this.$nextTick()
    this.skuRef = this.$refs.SKU
    await this.skuRef.fetchCapability(this.rdsItem.cloudregion_id)
    await this.setValues()
  },
  methods: {
    setValues () {
      const SKU = this.$refs.SKU
      const { engine, provider } = this.rdsItem
      const zoneIds = []
      const zoneNames = []
      let i = 0
      for (;;) {
        ++i
        const id = this.rdsItem[`zone${i}`]
        const name = this.rdsItem[`zone${i}_name`]
        if (id) {
          zoneIds.push(id)
          zoneNames.push(name)
        } else {
          break
        }
      }
      this.rdsZone = {
        [zoneIds.join('+')]: zoneNames.join('+'),
      }
      this.form.setFieldsValue({
        provider,
        engine,
        engine_version: this.rdsItem.engine_version,
        category: this.rdsItem.category,
        storage_type: this.rdsItem.storage_type,
        vcpu_count: this.rdsItem.vcpu_count,
        vmem_size_mb: this.rdsItem.vmem_size_mb,
        zones: zoneIds.join('+'),
        cloudregion_id: this.rdsItem.cloudregion_id,
        cloudregion: this.rdsItem.cloudregion_id,
      }, SKU.linkageValue)
    },
    // 获取CPU核数、内存、可用区
    capability_change () {
      this.skuRef.fetchSpecs()
    },
    specs_change () {
      this.skuRef.fetchSkus()
    },
    async handleValuesChange (fc, changedFields) {
      await this.$nextTick()
      Object.keys(changedFields).forEach(field => {
        if (changedFields[field] === undefined) return false
        let _field = field
        for (const k in this.keysChange) {
          if (this.keysChange[k].indexOf(_field) > -1) {
            _field = k
          }
        }
        const handleChange = this[`${_field}_change`]
        if (this[`${_field}_change`]) {
          return handleChange()
        }
      })
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            if (values.sku) {
              values.instance_type = values.sku.name
              delete values.sku
            }
            if (values.zones) {
              values.zones.split('+').forEach((zone, index) => {
                values[`zone${index + 1}`] = zone
              })
              delete values.zones
            }
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        await this.params.onManager('performAction', {
          id: this.params.data[0].id,
          steadyStatus: ['running'],
          managerArgs: {
            action: 'change-config',
            data: values,
          },
        })
        this.cancelDialog()
        this.params.refresh()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
