<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('common_699')}}</div>
    <div slot="body">
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_176')">
          <a-select v-decorator="decorators.provider" @change="handlePlatformChange" :placeholder="$t('db.text_30')">
            <a-select-option
              v-for="(item, index) in providerOptions"
              :key="index"
              :value="item.key">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('compute.text_15')">
          <base-select
            :remote="true"
            class="w-100"
            :needParams="true"
            v-decorator="decorators.account"
            resource="cloudaccounts"
            :params="providerParams"
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            :select-props="{ placeholder: $t('common_588') }" />
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
import { getProviders } from '../utils'
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
              message: this.$t('db.text_30'),
            }],
          },
        ],
        account: [
          'account',
          {
            rules: [{
              required: true,
              message: this.$t('network.text_215'),
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
      providerOptions: getProviders(),
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
