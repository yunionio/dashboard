<template>
  <div>
    <a-form-item :label="$t('system.text_210')" :extra="$t('system.text_211')">
      <a-input v-decorator="decorators.cas_server_url" />
    </a-form-item>
  </div>
</template>

<script>
export default {
  name: 'IDPCASEdit',
  props: {
    offsetWrapperCol: {
      type: Object,
      required: true,
    },
    fd: {
      type: Object,
      required: true,
    },
    fc: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      showProjectInput: false,
      showRoleInput: false,
      project: {},
      decorators: {
        cas_server_url: [
          'cas_server_url',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('system.text_243') },
              { validator: this.$validate('url'), message: this.$t('system.text_244') },
            ],
          },
        ],
        // service: [
        //   'service',
        //   {
        //     validateFirst: true,
        //     rules: [
        //       { required: true, message: '请输入登录地址' },
        //       { validator: this.$validate('url'), message: '请输入正确的URL' },
        //     ],
        //   },
        // ],
      },
    }
  },
  computed: {
    projectParams () {
      return {
        limit: 0,
        scope: this.scope,
        domain_id: this.fd.target_domain,
      }
    },
    roleParams () {
      return {
        limit: 0,
        scope: this.scope,
        domain_id: this.fd.target_domain,
      }
    },
    showCollapse () {
      return this.fd.target_domain
    },
  },
  watch: {
    'fd.target_domain' (val) {
      this.fc.resetFields(['default_cas_project_id', 'cas_project_attribute', 'default_cas_role_id', 'cas_role_attribute'])
    },
  },
}
</script>
