<template>
  <a-form
    :form="form.fc"
    v-bind="formItemLayout">
    <a-form-item :label="$t('system.text_101')">
      <a-input v-decorator="decorators.name" />
    </a-form-item>
    <a-form-item :label="$t('common.description')">
      <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
    </a-form-item>
    <a-form-item :label="$t('dictionary.domain')" v-if="isAdminMode && l3PermissionEnable">
      <base-select
        v-decorator="decorators.domain_id"
        resource="domains"
        version="v1"
        remote
        :params="{ enabled: true }"
        :remote-fn="q => ({ filter: `name.contains(${q})` })"
        :select-props="{ mode: 'default' }"
        :initLoaded.sync="domainOpsLoaded" />
    </a-form-item>
  </a-form>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'CreateRoleForm',
  props: {
    domain: String,
  },
  data () {
    return {
      domainOpsLoaded: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            rules: [
              {
                required: true,
                message: this.$t('system.text_194'),
                whitespace: true,
              },
            ],
          },
        ],
        description: ['description'],
        domain_id: [
          'domain_id',
          {
            rules: [
              {
                required: true,
                message: this.$t('rules.domain'),
              },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  computed: mapGetters(['isAdminMode', 'l3PermissionEnable']),
  watch: {
    domainOpsLoaded (val) {
      if (val) {
        this.form.fc.getFieldDecorator('domain_id', { initialValue: this.domain })
      }
    },
  },
  destroyed () {
    this.manager = null
  },
  created () {
    this.manager = new this.$Manager('roles', 'v1')
  },
  methods: {
    async create () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const response = await this.manager.create({
          data: values,
        })
        return response
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
