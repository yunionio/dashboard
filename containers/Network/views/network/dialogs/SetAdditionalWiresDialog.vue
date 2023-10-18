<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('network.additional_wires.set') }}</div>
    <div slot="body">
      <a-form :form="form.fc">
        <a-form-item :label="$t('network.text_571')" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.type">
            <a-radio-button value="auto">{{ $t('network.additional_wires.type.auto') }}</a-radio-button>
            <a-radio-button value="manual">{{ $t('network.additional_wires.type.manual') }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-bind="formItemLayoutWithOutLabel" v-if="form.fd.type === 'manual'">
          <base-select
            resource="wires"
            v-decorator="decorators.wires"
            :selectProps="{ 'placeholder': $t('network.text_572'), mode: 'multiple' }"
            remote
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            :params="wireParams"
            :mapper="wireMapper" />
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
import { PROVIDER_MAP } from '@/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'SetAdditionalWiresDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const currentData = this.params.currentData
    const additionalWires = currentData.additional_wires && currentData.additional_wires.map(item => item.wire_id)

    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.$set(this.form.fd, key, values[key])
            })
          },
        }),
        fd: {},
      },
      decorators: {
        type: [
          'type',
          {
            initialValue: 'auto',
          },
        ],
        wires: [
          'wires',
          {
            initialValue: additionalWires,
            rules: [
              { required: true, message: this.$t('network.text_572') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 19,
        },
        labelCol: {
          span: 5,
        },
      },
      formItemLayoutWithOutLabel: {
        wrapperCol: {
          span: 19,
          offset: 5,
        },
      },
      wireParams: {
        scope: this.$store.getters.scope,
        provider: PROVIDER_MAP.VMware.key,
        limit: 20,
      },
    }
  },
  methods: {
    wireMapper (list) {
      if (list && list.length > 0) {
        return list.filter(item => {
          const wid = this.params.currentData.wire_id
          return item.id !== wid
        })
      }
      return []
    },
    async doSubmit (values) {
      const id = this.params.currentData.id
      const params = {}

      if (values.type === 'manual') {
        params.wire_ids = values.wires
      }
      await new this.$Manager('networks').performAction({
        id,
        action: 'sync-additional-wires',
        data: params,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        this.doSubmit(values)
        this.cancelDialog()
        this.$message.success(this.$t('common.success'))
        this.params.success && this.params.success()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
