<template>
  <div>
    <a-form
      :form="form.fc"
      v-bind="formItemLayout">
      <a-form-item :label="$t('network.text_198')">
        <a-select v-decorator="decorators.provider" @change="handlePlatformChange" :placeholder="$t('network.text_334', [$t('common_283')])">
          <a-select-option
            v-for="(item, index) in providerOptions"
            :key="index"
            :value="item.key">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :label="$t('common_710', [$t('common_711')])">
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
</template>

<script>
import { getProviders } from '@Network/views/dns-zonecache/utils'

export default {
  name: 'DnsZoneCache',
  props: {
    params: Object,
  },
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
              message: this.$t('network.text_334', [this.$t('common_283')]),
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
        project_domain: this.params.data[0].project_domain,
      }
    },
    doSubmit (data) {
      return new this.$Manager('dns_zones').performAction({
        id: this.params.data[0].id,
        action: 'cache',
        data,
      })
    },
  },
}
</script>
