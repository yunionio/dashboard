<template>
  <div>
    <page-header :title="$t('network.text_769')" />
    <page-body>
      <a-form
        class="mt-3"
        :form="form.fc">
        <a-form-item v-bind="formItemLayout" :label="$t('network.text_205', [$t('dictionary.domain')])" v-if="$store.getters.isAdminMode">
          <domain-select v-decorator="decorators.project_domain" @change="handleDomainChange" />
        </a-form-item>
        <a-form-item :label="$t('network.text_198')" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.platform">
            <a-radio-button value="Google">Google</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('network.text_21')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :placeholder="$t('network.text_684')" />
        </a-form-item>
        <a-form-item :label="$t('common.description')" v-bind="formItemLayout">
          <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_15')" required v-bind="formItemLayout">
          <base-select
            class="w-50"
            v-decorator="decorators.cloudprovider"
            resource="cloudproviders"
            :params="cloudproviderParams"
            :isDefaultSelect="true"
            :needParams="true"
            :showSync="true"
            :select-props="{ placeholder: $t('compute.text_149') }"
            :resList.sync="cloudproviderData" />
        </a-form-item>
      </a-form>
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button class="float-right" type="primary" @click="handleConfirm" :loading="loading">{{ $t('common_258') }}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import DomainSelect from '@/sections/DomainSelect'

export default {
  name: 'GlobalVPCCreate',
  components: {
    DomainSelect,
  },
  data () {
    return {
      loading: false,
      isGoogle: false,
      isAws: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            if (values.cloudregion) {
              this.cloudregion = values.cloudregion
            }
          },
        }),
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            validateTrigger: ['blur'],
            rules: [
              { required: true, message: this.$t('network.text_770') },
              { validator: this.$validate('broadName') },
            ],
          },
        ],
        platform: [
          'platform',
          {
            initialValue: 'Google',
            rules: [{ required: true }],
          },
        ],
        description: ['description'],
        cloudprovider: [
          'cloudprovider',
          {
            rules: [
              { required: true, message: this.$t('network.text_689') },
            ],
          },
        ],
        project_domain: [
          'project_domain',
          {
            initialValue: this.$store.getters.userInfo.projectDomainId,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          md: { span: 17 },
          xl: { span: 19 },
          xxl: { span: 21 },
        },
        labelCol: {
          md: { span: 7 },
          xl: { span: 5 },
          xxl: { span: 3 },
        },
      },
      project_domain: this.$store.getters.userInfo.projectDomainId,
      cloudproviderData: [],
      cloudregion: '',
      regionList: {},
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'userInfo']),
    cloudproviderParams () {
      const params = {
        limit: 0,
        enabled: 1,
        details: true,
        scope: this.scope,
        provider: 'Google',
      }
      if (this.isAdminMode) {
        params.admin = true
        params.project_domain = this.project_domain
        delete params.scope
      }
      return params
    },
  },
  provide () {
    return {
      form: this.form,
    }
  },
  methods: {
    doCreate (data) {
      return new this.$Manager('globalvpcs').create({ data })
    },
    handleDomainChange (val) {
      this.project_domain = val
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const params = {
          name: values.name,
          description: values.description,
          manager: values.cloudprovider,
          platform: values.platform, // 未起作用
        }
        if (values.project_domain) {
          params.project_domain = values.project_domain
        }
        await this.doCreate(params)
        this.loading = false
        this.$message.success(this.$t('k8s.text_184'))
        this.$router.push('/globalvpc')
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
