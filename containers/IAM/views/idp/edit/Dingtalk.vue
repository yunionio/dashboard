<template>
  <div>
    <a-form-item label="AppId">
      <a-input v-decorator="decorators.app_id" :placeholder="$t('common_527')" />
    </a-form-item>
    <a-form-item label="Secret">
      <a-input v-decorator="decorators.secret" :placeholder="$t('common_528')" />
    </a-form-item>
  </div>
</template>

<script>
export default {
  name: 'IdpEditDingding',
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
        app_id: ['app_id', {
          rules: [{ required: true, message: this.$t('common_527') }],
        }],
        secret: ['secret', {
          rules: [{ required: true, message: this.$t('common_528') }],
        }],
      },
    }
  },
}
</script>
