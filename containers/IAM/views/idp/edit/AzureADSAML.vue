<template>
  <div>
    <a-form-item label="TenantId">
      <a-input v-decorator="decorators.tenant_id" :placeholder="$t('common_524')" />
    </a-form-item>
  </div>
</template>

<script>
export default {
  name: 'IdpEditAzureAdOauth',
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
        tenant_id: ['tenant_id', {
          rules: [{ required: true, message: this.$t('common_524') }],
        }],
      },
    }
  },
}
</script>
