<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">新建缓存</div>
    <div slot="body">
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_176')">
          <a-select v-decorator="decorators.provider" @change="handlePlatformChange" placeholder="请选择平台">
            <a-select-option
              v-for="(item, index) in platformOptions"
              :key="index"
              :value="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="指定云订阅">
          <base-select
            :remote="true"
            class="w-100"
            :needParams="true"
            v-decorator="decorators.account"
            resource="cloudaccounts"
            :params="providerParams"
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            :select-props="{ placeholder: '请选择云订阅' }" />
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
  name: 'DnsZonecacheCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        provider: [
          'provider',
          {
            rules: [{
              required: true,
              message: '请选择平台',
            }],
          },
        ],
        account: [
          'account',
          {
            rules: [{
              required: true,
              message: '请选择云账号',
            }],
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
      platformOptions: [{ label: '腾讯云', value: 'Qcloud' }, { label: 'AWS', value: 'Aws' }],
      providerParams: {},
    }
  },
  methods: {
    handlePlatformChange (e) {
      this.providerParams = {
        usable: true,
        provider: e,
      }
    },
    doSubmit (data) {
      return new this.$Manager('dns_zones').performAction({
        id: this.params.resData.id,
        action: 'cache',
        data,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const newValues = {
          cloudaccount_id: values.account,
        }
        await this.doSubmit(newValues)
        this.loading = false
        this.params.refresh && this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
