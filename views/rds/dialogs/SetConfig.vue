<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="params.title" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        class="mt-3"
        :form="form.fc">
        <s-k-u ref="SKU" :disableds="['engine', 'engine_version', 'zones']" :rdsItem="rdsItem">
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
import { CreateServerForm } from '@Compute/constants'
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
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
      rdsZone: {},
    }
  },
  computed: {
    form () {
      const fc = this.$form.createForm(this)
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
  },
  provide () {
    return {
      form: this.form,
      formItemLayout: this.formItemLayout,
    }
  },
  created () {
    this.form.fc.getFieldDecorator('zones', { preserve: true })
  },
  mounted () {
    this._fetchs()
  },
  methods: {
    setValues () {
      const SKU = this.$refs['SKU']
      const { engine } = this.rdsItem
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
        engine,
        engine_version: this.rdsItem['engine_version'],
        category: this.rdsItem['category'],
        storage_type: this.rdsItem['storage_type'],
        vcpu_count: 2, // this.rdsItem['vcpu_count'],
        vmem_size_mb: this.rdsItem['vmem_size_mb'],
        zones: zoneIds.join('+'),
      }, SKU.linkageValue)
    },
    async _fetchs () {
      const SKU = this.$refs['SKU']
      await SKU.fetchFilters(this.rdsItem['cloudregion_id'])
      await this.setValues()
      await SKU.fetchSpecs()
      await SKU.fetchSkus()
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            if (values.sku) {
              values['instance_type'] = values.sku.name
              delete values.sku
            }
            if (values.zones) {
              values.zones.split('+').forEacch((zone, index) => {
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
        await this.params.list.onManager('performAction', {
          id: this.params.data[0].id,
          steadyStatus: ['running'],
          managerArgs: {
            action: 'change-config',
            data: values,
          },
        })
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
