<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('network.text_352')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.lb_backend')" :count="params.data.length" :action="$t('network.text_352')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item v-if="params.updateFields.weight" :label="$t('network.text_166')">
          <a-input-number :min="0" :max="maxWeight" v-decorator="decorators.weight" />
        </a-form-item>
        <a-form-item v-if="params.updateFields.port" :label="$t('network.text_165')">
          <a-input-number :min="1" :max="65535" v-decorator="decorators.port" />
        </a-form-item>
        <a-form-item v-if="params.updateFields.status" :label="$t('network.text_189')">
          <a-switch v-decorator="decorators.status" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'BackendUpdateDialog',
  components: {
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        weight: [
          'weight',
          {
            initialValue: this.params.data[0].weight,
            validateFirst: true,
            rules: [
              { type: 'integer', required: true, message: this.$t('network.text_177'), trigger: 'blur' },
              { type: 'integer', min: 0, max: this.maxWeight, message: this.$t('network.text_353', [this.maxWeight]), trigger: 'blur' },
            ],
          },
        ],
        port: [
          'port',
          {
            initialValue: this.params.data[0].port,
            validateFirst: true,
            rules: [
              { type: 'integer', required: true, message: this.$t('network.text_176'), trigger: 'blur' },
            ],
          },
        ],
        status: [
          'status',
          {
            valuePropName: 'checked',
            initialValue: this.params.data[0].status === 'enabled',
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  computed: {
    maxWeight () {
      const w100Providers = ['aliyun', 'huawei', 'qcloud', 'aws']
      let maxWeight = 256
      const val = this.params.data[0]
      if (val && val.provider) {
        if (w100Providers.includes(val.provider.toLowerCase())) {
          maxWeight = 100
        }
      }
      return maxWeight
    },
  },
  methods: {
    doUpdate (id, values) {
      const data = {}
      if (this.params.updateFields.weight) {
        data.weight = values.weight
      }
      if (this.params.updateFields.port) {
        data.port = values.port
      }
      if (this.params.updateFields.status) {
        data.status = values.status ? 'enabled' : 'disabled'
      }
      return this.params.onManager('update', {
        id,
        managerArgs: {
          data,
        },
        steadyStatus: {
          status: Object.values(expectStatus.lb).flat(),
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doUpdate(this.params.data[0].id, values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
