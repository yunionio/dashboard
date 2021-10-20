<template>
  <div>
    <a-form :form="form.fc" v-if="decorators" v-bind="formLayout">
      <a-form-item :label="$t('cloudenv.text_95')">
        <a-input v-decorator="decorators.name" :placeholder="$t('cloudenv.text_190')" />
      </a-form-item>
      <a-form-item :label="keySecretField.label.k">
        <a-input v-decorator="decorators.username" :placeholder="keySecretField.placeholder.k" />
        <div slot="extra">
          {{$t('cloudenv.text_236', [keySecretField.text, keySecretField.label.k])}}
          <help-link :href="docs[provider.toLowerCase()]">{{$t('cloudenv.text_237')}}</help-link>
        </div>
      </a-form-item>
      <a-form-item :label="keySecretField.label.s">
        <a-input-password v-decorator="decorators.password" :placeholder="keySecretField.placeholder.s" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.cloudaccount.hcso.default_region')">
        <a-input v-decorator="decorators.default_region" :placeholder="$t('common.tips.input', [$t('cloudenv.cloudaccount.hcso.default_region')])" />
        <div slot="extra">
          {{$t('cloudenv.cloudaccount.hcso.endpoint_domain.tips')}}
        </div>
      </a-form-item>
      <a-form-item :label="$t('cloudenv.cloudaccount.hcso.endpoint_domain')">
        <a-input v-decorator="decorators.endpoint_domain" :placeholder="$t('common.tips.input', [$t('cloudenv.cloudaccount.hcso.endpoint_domain')])" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.cloudaccount.hcso.iam')">
        <a-input v-decorator="decorators.iam" :placeholder="$t('common.tips.optional_input', [$t('cloudenv.cloudaccount.hcso.iam')])" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.cloudaccount.hcso.ecs')">
        <a-input v-decorator="decorators.ecs" :placeholder="$t('common.tips.input', [$t('cloudenv.cloudaccount.hcso.ecs')])" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.cloudaccount.hcso.vpc')">
        <a-input v-decorator="decorators.vpc" :placeholder="$t('common.tips.input', [$t('cloudenv.cloudaccount.hcso.vpc')])" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.cloudaccount.hcso.ims')">
        <a-input v-decorator="decorators.ims" :placeholder="$t('common.tips.optional_input', [$t('cloudenv.cloudaccount.hcso.ims')])" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.cloudaccount.hcso.evs')">
        <a-input v-decorator="decorators.evs" :placeholder="$t('common.tips.optional_input', [$t('cloudenv.cloudaccount.hcso.evs')])" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.cloudaccount.hcso.dcs')">
        <a-input v-decorator="decorators.dcs" :placeholder="$t('common.tips.optional_input', [$t('cloudenv.cloudaccount.hcso.dcs')])" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.cloudaccount.hcso.elb')">
        <a-input v-decorator="decorators.elb" :placeholder="$t('common.tips.optional_input', [$t('cloudenv.cloudaccount.hcso.elb')])" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.cloudaccount.hcso.obs')">
        <a-input v-decorator="decorators.obs" :placeholder="$t('common.tips.optional_input', [$t('cloudenv.cloudaccount.hcso.obs')])" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.cloudaccount.hcso.rds')">
        <a-input v-decorator="decorators.rds" :placeholder="$t('common.tips.optional_input', [$t('cloudenv.cloudaccount.hcso.rds')])" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.cloudaccount.hcso.nat')">
        <a-input v-decorator="decorators.nat" :placeholder="$t('common.tips.optional_input', [$t('cloudenv.cloudaccount.hcso.nat')])" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.cloudaccount.hcso.cts')">
        <a-input v-decorator="decorators.cts" :placeholder="$t('common.tips.optional_input', [$t('cloudenv.cloudaccount.hcso.cts')])" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.cloudaccount.hcso.ces')">
        <a-input v-decorator="decorators.ces" :placeholder="$t('common.tips.optional_input', [$t('cloudenv.cloudaccount.hcso.ces')])" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.cloudaccount.hcso.eps')">
        <a-input v-decorator="decorators.eps" :placeholder="$t('common.tips.optional_input', [$t('cloudenv.cloudaccount.hcso.eps')])" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.cloudaccount.hcso.sfs_turbo')">
        <a-input v-decorator="decorators.sfs_turbo" :placeholder="$t('common.tips.optional_input', [$t('cloudenv.cloudaccount.hcso.sfs_turbo')])" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.cloudaccount.hcso.default_subnet_dns')">
        <a-input v-decorator="decorators.default_subnet_dns" :placeholder="$t('common.tips.optional_input', [$t('cloudenv.cloudaccount.hcso.default_subnet_dns')])" />
        <div slot="extra">
          {{$t('cloudenv.cloudaccount.hcso.default_subnet_dns.tips')}}
        </div>
      </a-form-item>
      <domain-project :fc="form.fc" :form-layout="formLayout" :decorators="{ project: decorators.project, domain: decorators.domain, auto_create_project: decorators.auto_create_project }" />
      <proxy-setting :fc="form.fc" :fd="form.fd" ref="proxySetting" />
      <auto-sync :fc="form.fc" />
      <share-mode :fd="form.fd" />
    </a-form>
  </div>
</template>

<script>
import _ from 'lodash'
import DomainProject from '../../../components/DomainProject'
import createMixin from './createMixin'
import AutoSync from '@Cloudenv/views/cloudaccount/components/AutoSync'
import ProxySetting from '@Cloudenv/views/cloudaccount/components/ProxySetting'
import ShareMode from '@Cloudenv/views/cloudaccount/components/ShareMode'
import { getCloudaccountDocs, keySecretFields } from '@Cloudenv/views/cloudaccount/constants'
import { isRequired } from '@/utils/validate'

export default {
  name: 'HCSO',
  components: {
    AutoSync,
    DomainProject,
    ProxySetting,
    ShareMode,
  },
  mixins: [createMixin],
  data () {
    const keySecretField = keySecretFields[this.provider.toLowerCase()]
    this.endpoint_domain_change = _.debounce(this.endpoint_domain_change, 500)
    this.default_region_change = _.debounce(this.default_region_change, 500)
    return {
      docs: getCloudaccountDocs(this.$store.getters.scope),
      decorators: this.getDecorators(keySecretField),
      services: {
        iam: 'iam',
        ecs: 'ecs',
        vpc: 'vpc',
        ims: 'ims',
        evs: 'evs',
        dcs: 'dcs',
        elb: 'elb',
        obs: 'obs',
        rds: 'rds',
        nat: 'nat',
        cts: 'cts',
        ces: 'ces',
        eps: 'eps',
        sfs_turbo: 'sfs-turbo',
      },
      prevs: {
        default_region: '',
        endpoint_domain: '',
      },
    }
  },
  methods: {
    getDecorators (initKeySecretFields) {
      const keySecretField = this.keySecretField || initKeySecretFields
      const decorators = {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('cloudenv.text_190') },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        username: [
          keySecretField.k,
          {
            rules: [
              { required: true, message: keySecretField.placeholder.k },
            ],
          },
        ],
        password: [
          keySecretField.s,
          {
            rules: [
              { required: true, message: keySecretField.placeholder.s },
            ],
          },
        ],
        domain: [
          'domain',
          {
            initialValue: this.$store.getters.userInfo.projectDomainId,
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
        endpoint_domain: [
          'endpoint_domain',
          {
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('cloudenv.cloudaccount.hcso.endpoint_domain')]) },
            ],
          },
        ],
        default_region: [
          'default_region',
          {
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('cloudenv.cloudaccount.hcso.default_region')]) },
            ],
          },
        ],
        iam: [
          'iam',
        ],
        ecs: [
          'ecs',
        ],
        vpc: [
          'vpc',
        ],
        ims: [
          'ims',
        ],
        evs: [
          'evs',
        ],
        dcs: [
          'dcs',
        ],
        elb: [
          'elb',
        ],
        obs: [
          'obs',
        ],
        rds: [
          'rds',
        ],
        nat: [
          'nat',
        ],
        cts: [
          'cts',
        ],
        ces: [
          'ces',
        ],
        eps: [
          'eps',
        ],
        sfs_turbo: [
          'sfs_turbo',
        ],
        default_subnet_dns: [
          'default_subnet_dns',
        ],
      }
      return decorators
    },
    endpoints (domain, region) {
      const prevs = {}
      for (const k in this.services) {
        prevs[k] = this.form.fc.getFieldValue(k)
      }

      const currents = {}
      for (const k in prevs) {
        if (prevs[k] && prevs[k].length > 0) {
          const i = prevs[k].lastIndexOf(this.prevs.endpoint_domain)
          if (i > -1 && domain && domain.length > 0) {
            prevs[k] = prevs[k].substring(0, i) + domain
          }
          if (region && region.length > 0) {
            prevs[k] = prevs[k].replace(this.prevs.default_region, region)
          }
          currents[k] = prevs[k]
        } else {
          if (domain && domain.length > 0 && region && region.length > 0) {
            currents[k] = [k, region, domain].join('.')
          }
        }
      }

      return currents
    },
    endpoint_domain_change () {
      const d = this.form.fc.getFieldValue('endpoint_domain')
      const r = this.form.fc.getFieldValue('default_region')
      this.form.fc.setFieldsValue(this.endpoints(d, r))
      this.prevs.endpoint_domain = d
    },
    default_region_change () {
      const d = this.form.fc.getFieldValue('endpoint_domain')
      const r = this.form.fc.getFieldValue('default_region')
      this.form.fc.setFieldsValue(this.endpoints(d, r))
      this.prevs.default_region = r
    },
  },
}
</script>
