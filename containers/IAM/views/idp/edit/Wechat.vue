<template>
  <div>
    <a-form-item :label="$t('system.cropid')">
      <a-input v-decorator="decorators.corp_id" :placeholder="$t('common_544')" />
    </a-form-item>
    <a-form-item label="AgentId">
      <a-input v-decorator="decorators.agent_id" :placeholder="$t('common_545')" />
    </a-form-item>
    <a-form-item label="Secret">
      <a-input v-decorator="decorators.corp_secret" :placeholder="$t('common_546')" />
    </a-form-item>
  </div>
</template>

<script>
export default {
  name: 'IdpEditWechat',
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
        corp_id: ['corp_id', {
          rules: [{ required: true, message: this.$t('common_544') }],
        }],
        agent_id: ['agent_id', {
          rules: [{ required: true, message: this.$t('common_545') }],
        }],
        corp_secret: ['secret', {
          rules: [{ required: true, message: this.$t('common_546') }],
        }],
      },
    }
  },
}
</script>
