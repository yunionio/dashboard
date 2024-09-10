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
      <domain-project :fc="form.fc" :form-layout="formLayout" :decorators="{ project: decorators.project, domain: decorators.domain, auto_create_project: decorators.auto_create_project }" :cloneData="cloneData" />
      <blocked-resources :decorators="{ isOpenBlockedResources: decorators.isOpenBlockedResources, blockedResources: decorators.blockedResources }" :cloneData="cloneData" />
      <proxy-setting :fc="form.fc" :fd="form.fd" ref="proxySetting" :cloneData="cloneData" />
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
    let initDomain = {
      key: this.$store.getters.userInfo.projectDomainId,
      label: this.$store.getters.userInfo.projectDomain,
    }
    const {
      domain_id,
      project_domain,
      auto_create_project: initAutoCreateProject = false,
      access_url: initAuthUrl = '',
    } = this.cloneData
    if (domain_id && project_domain) {
      initDomain = {
        key: domain_id,
        label: project_domain,
      }
    }
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
            initialValue: initAuthUrl,
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('cloudenv.auth_url_label')]) },
            ],
          },
        ],
        domain: [
          'domain',
          {
            initialValue: initDomain,
            rules: [
              { validator: isRequired(), message: this.$t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        auto_create_project: [
          'auto_create_project',
          {
            initialValue: initAutoCreateProject,
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
