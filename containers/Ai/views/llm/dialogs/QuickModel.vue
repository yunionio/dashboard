<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('aice.llm')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('aice.model')">
          <base-select v-decorator="decorators.model" :options="modelOptions" :select-props="{ placeholder: $t('common.tips.select', [$t('aice.model')]) }" />
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
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'LlmQuickModelDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.params.actionText,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.form.fd[key] = values[key]
            })
          },
        }),
        fd: {
          model: [],
        },
      },
      decorators: {
        model: [
          'model',
          {
            initialValue: [],
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.model')]) },
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
      modelOptions: [],
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    columns () {
      const showFields = ['name', 'phone_ip', 'phone_image', 'phone_model']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
  },
  created () {
    this.$hM = new this.$Manager('llms')
    this.queryModels()
  },
  methods: {
    async queryModels () {
      const response = await new this.$Manager(`llms/${this.params.data[0].id}/probed-models`, 'v2').list({
        params: {
          scope: this.$store.getters.scope,
        },
      })
      const { data } = response
      const keys = Object.keys(data)
      this.modelOptions = keys.map(key => {
        return {
          id: data[key].model_id,
          ...data[key],
        }
      })
    },
    async doSubmit () {
      const data = { method: 'install' }
      data.model = this.form.fd.model
      const ids = this.params.data.map(item => item.id)
      return this.params.onManager('batchPerformAction', {
        id: ids,
        // steadyStatus: 'ready',
        managerArgs: {
          action: 'quick-models',
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.doSubmit()
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
