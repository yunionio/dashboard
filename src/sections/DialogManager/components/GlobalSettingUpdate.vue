<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('system.text_22')}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :name="$t('dictionary.globalsetting')" :action="$t('system.text_188', [firstData['dialogLabel'] || firstData['label']])" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('system.text_102')" v-bind="formItemLayout" :extra="firstData['dialogDesc'] || firstData['desc']">
          <component :is="element" v-bind="firstData.opt.props" v-decorator="decorators.value" class="w-100">
            <template v-if="element === 'a-select'">
              <a-select-option
                v-for="item of firstData.opt.options"
                :key="item.key"
                :value="item.key"
                :disabled="item.disabled">{{ item.label }}</a-select-option>
            </template>
          </component>
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
  name: 'GlobalSettingUpdateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const initialValue = this.params.data[0].value
    let required = true
    if (this.params.data[0] && this.params.data[0].opt?.notRequired) {
      required = false
    }
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            this.form.fd.value = values.value
          },
        }),
        fd: {
          value: initialValue,
        },
      },
      decorators: {
        value: [
          'value',
          {
            initialValue,
            rules: [
              {
                required,
                message: this.$t('system.text_192'),
              },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 22,
        },
        labelCol: {
          span: 2,
        },
      },
    }
  },
  computed: {
    firstData () {
      return this.params.data[0]
    },
    element () {
      return this.firstData.opt.component
    },
  },
  methods: {
    doUpdate (data) {
      return this.$http({
        method: 'POST',
        url: `/v1/services/${this.firstData.serviceId}/config`,
        data: {
          action: 'update',
          config: {
            default: {
              [this.firstData.key]: data.value,
            },
          },
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.form.fc.validateFields()
        values = {
          value: this.firstData.opt.parser ? this.firstData.opt.parser(values.value) : values.value,
        }
        await this.doUpdate(values)
        const newVal = this.firstData.opt.formatter ? this.firstData.opt.formatter(values.value) : values.value
        this.params.success(this.firstData.key, newVal, this.firstData.serviceId)
        if (this.params.ok) this.params.ok(this.firstData.key, newVal, this.firstData.serviceId)
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
