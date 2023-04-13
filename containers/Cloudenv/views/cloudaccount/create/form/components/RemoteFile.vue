<template>
  <div>
    <a-form :form="form.fc" v-bind="formLayout">
      <a-form-item :label="$t('cloudenv.text_95')">
        <a-input v-decorator="decorators.name" :placeholder="$t('cloudenv.text_190')" />
      </a-form-item>
      <a-form-item :label="$t('common.description')">
        <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.auth_url_label')" :extra="$t('cloudenv.auth_url_extra')">
        <a-input v-decorator="decorators.auth_url" />
      </a-form-item>
      <domain-project :fc="form.fc" :form-layout="formLayout" :decorators="{ project: decorators.project, domain: decorators.domain, auto_create_project: decorators.auto_create_project }" />
      <proxy-setting :fc="form.fc" :fd="form.fd" ref="proxySetting" />
    </a-form>
  </div>
</template>

<script>
import ProxySetting from '@Cloudenv/views/cloudaccount/components/ProxySetting'
import DomainProject from '../../../components/DomainProject'
import createMixin from './createMixin'
import { isRequired } from '@/utils/validate'

export default {
  name: 'RemoteFileCreate',
  components: {
    ProxySetting,
    DomainProject,
  },
  mixins: [createMixin],
  data () {
    return {
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('cloudenv.text_190') },
              // { validator: this.$validate('resourceName') },
            ],
          },
        ],
        description: ['description'],
        auth_url: [
          'auth_url',
          {
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('cloudenv.auth_url_label')]) },
            ],
          },
        ],
        domain: [
          'domain',
          {
            initialValue: {
              key: this.$store.getters.userInfo.projectDomainId,
              label: this.$store.getters.userInfo.projectDomain,
            },
            rules: [
              { validator: isRequired(), message: this.$t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        auto_create_project: [
          'auto_create_project',
          {
            initialValue: false,
            valuePropName: 'checked',
          },
        ],
      },
    }
  },
}
</script>

<style>

</style>
