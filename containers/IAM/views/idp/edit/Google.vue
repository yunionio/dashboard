<template>
  <div>
    <a-form-item label="ClientID">
      <a-input v-decorator="decorators.client_id" :placeholder="$t('common_525')" />
    </a-form-item>
     <a-form-item label="ClientSecret">
      <a-input v-decorator="decorators.client_secret" :placeholder="$t('common_526')" />
    </a-form-item>
  </div>
</template>
<script>
export default {
  name: 'IdpEditGoogle',
  data () {
    return {
      decorators: {
        client_id: ['client_id', {
          rules: [{ required: true, message: this.$t('common_525') }],
        }],
        client_secret: ['client_secret', {
          rules: [{ required: true, message: this.$t('common_526') }],
        }],
      },
    }
  },
}
</script>
