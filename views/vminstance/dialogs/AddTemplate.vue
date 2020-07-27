<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_1166')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.text_1166')" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc"  v-bind="formItemLayout">
        <a-form-item :label="$t('common.name')">
          <a-input v-decorator="decorators.name" :placeholder="$t('compute.text_210')" />
          <name-repeated
            v-slot:extra
            res="servertemplates"
            :name="form.fc.getFieldValue('generate_name')" />
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
import NameRepeated from '@/sections/NameRepeated'

export default {
  name: 'VmAddTemplateDialog',
  components: {
    NameRepeated,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'generate_name',
          {
            rules: [
              { required: true, message: this.$t('compute.text_210') },
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
    columns () {
      const fields = ['name', 'instance_type', 'brand']
      return this.params.columns.filter(item => {
        const { field } = item
        return fields.indexOf(field) > -1
      })
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.params.onManager('performAction', {
          id: this.params.data[0].id,
          steadyStatus: ['running', 'ready'],
          managerArgs: {
            action: 'save-template',
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
