<template>
  <div>
    <a-form-item label="CloudEnv">
      <a-radio-group v-decorator="decorators.cloud_env">
        <a-radio-button
          v-for="(v, k) in $t('idpAzureCloudEnv')"
          :value="k"
          :key="k">{{v}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="ClientID">
      <a-input v-decorator="decorators.client_id" :placeholder="$t('common_525')" />
    </a-form-item>
    <a-form-item label="ClientSecret">
      <a-input v-decorator="decorators.client_secret" :placeholder="$t('common_526')" />
    </a-form-item>
    <a-form-item label="TenantId">
      <a-input v-decorator="decorators.tenant_id" :placeholder="$t('common_524')" />
    </a-form-item>
  </div>
</template>

<script>
export default {
  name: 'IdpEditAzureADSAML',
  props: {
    fc: {
      type: Object,
    },
    offsetWrapperCol: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      decorators: {
        cloud_env: ['cloud_env', {
          initialValue: 'china',
          rules: [{ required: true, message: this.$t('common_525') }],
        }],
        client_id: ['client_id', {
          rules: [{ required: true, message: this.$t('common_525') }],
        }],
        client_secret: ['client_secret', {
          rules: [{ required: true, message: this.$t('common_526') }],
        }],
        tenant_id: ['tenant_id', {
          rules: [{ required: true, message: this.$t('common_524') }],
        }],
      },
    }
  },
}
</script>
