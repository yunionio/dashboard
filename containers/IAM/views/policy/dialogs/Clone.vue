<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('table.action.clone')}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="$t('table.action.clone')" :name="$t('res.policy')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('table.title.name')">
          <a-input v-decorator="decorators.name" />
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

export default {
  name: 'PolicyCloneDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      contactArrOpts: [],
      decorators: {
        name: [
          'name',
          {
            rules: [
              {
                required: true,
                message: this.$t('common.tips.input', [this.$t('res.policy')]),
                whitespace: true,
              },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  destroyed () {
    this.manager = null
  },
  created () {
    this.manager = new this.$Manager('policies', 'v1')
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const { name } = values
        const { scope, policy, description } = this.params.data[0]
        const data = {
          type: name,
          scope,
          policy,
        }
        if (description) {
          data.description = description
        }
        await this.manager.create({
          data,
        })
        this.loading = false
        this.params.success()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
