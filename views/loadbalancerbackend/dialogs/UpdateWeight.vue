<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">修改权重</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.lb_backend')" :count="params.data.length" action="修改权重" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item label="权重">
          <a-input-number :min="0" :max="maxWeight" v-decorator="decorators.weight" />
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
  name: 'BackendUpdateWeightDialog',
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
              { type: 'integer', required: true, message: '请输入权重', trigger: 'blur' },
              { type: 'integer', min: 0, max: this.maxWeight, message: `请输入范围在 0-${this.maxWeight} 之间`, trigger: 'blur' },
            ],
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
    doUpdate (id, data) {
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
        let values = await this.form.fc.validateFields()
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
