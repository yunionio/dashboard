<template>
  <div>
    <a-form-item :label="$t('system.text_217')" :extra="$t('system.text_218')">
      <a-input v-decorator="decorators.url" />
    </a-form-item>
    <a-form-item :label="$t('system.text_219')" :extra="$t('system.text_220')">
      <a-input v-decorator="decorators.suffix" />
    </a-form-item>
    <a-form-item :label="$t('system.text_227', [$t('dictionary.user')])">
      <a-input v-decorator="decorators.user" />
    </a-form-item>
    <a-form-item :label="$t('system.text_221')">
      <a-input-password v-decorator="decorators.password" />
    </a-form-item>
    <a-form-item :label="`${$t('dictionary.user')}DN`" :extra="$t('system.text_222')">
      <a-input v-decorator="decorators.user_tree_dn" />
    </a-form-item>
    <a-form-item :label="`${$t('dictionary.group')}DN`" :extra="$t('system.text_222')">
      <a-input v-decorator="decorators.group_tree_dn" />
    </a-form-item>
  </div>
</template>

<script>
export default {
  name: 'IDPMSADOneEdit',
  props: {
    offsetWrapperCol: {
      type: Object,
      required: true,
    },
    fd: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      decorators: {
        url: [
          'url',
          {
            rules: [
              { required: true, message: this.$t('system.text_236') },
            ],
          },
        ],
        suffix: [
          'suffix',
          {
            rules: [
              { required: true, message: this.$t('system.text_237') },
            ],
          },
        ],
        user: [
          'user',
          {
            rules: [
              { required: true, message: this.$t('scope.text_331') },
            ],
          },
        ],
        password: [
          'password',
          {
            rules: [
              { required: true, message: this.$t('scope.text_333') },
            ],
          },
        ],
        user_tree_dn: [
          'user_tree_dn',
          {
            rules: [
              { required: true, message: this.$t('system.text_240') },
            ],
          },
        ],
        group_tree_dn: [
          'group_tree_dn',
          {
            rules: [
              { required: true, message: this.$t('system.text_241') },
            ],
          },
        ],
      },
    }
  },
}
</script>
