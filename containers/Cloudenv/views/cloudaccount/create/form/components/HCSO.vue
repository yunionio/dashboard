<template>
  <div>
    <a-form :form="form.fc" v-if="decorators" v-bind="formLayout">
      <a-form-item :label="$t('cloudenv.text_95')">
        <a-input v-decorator="decorators.name" :placeholder="$t('cloudenv.text_190')" />
      </a-form-item>
      <a-form-item :label="$t('common.description')">
        <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
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
      <domain-project :fc="form.fc" :form-layout="formLayout" :decorators="{ project: decorators.project, domain: decorators.domain, auto_create_project: decorators.auto_create_project }" :cloneData="cloneData" />
      <blocked-resources :decorators="{ isOpenBlockedResources: decorators.isOpenBlockedResources, blockedResources: decorators.blockedResources }" :cloneData="cloneData" />
      <proxy-setting :fc="form.fc" :fd="form.fd" ref="proxySetting" :cloneData="cloneData" />
      <auto-sync :fc="form.fc" :cloneData="cloneData" />
      <read-only :cloneData="cloneData" />
      <share-mode :fd="form.fd" :cloneData="cloneData" />
    </a-form>
  </div>
</template>

<script>
import _ from 'lodash'
import AutoSync from '@Cloudenv/views/cloudaccount/components/AutoSync'
import ProxySetting from '@Cloudenv/views/cloudaccount/components/ProxySetting'
import ShareMode from '@Cloudenv/views/cloudaccount/components/ShareMode'
import ReadOnly from '@Cloudenv/views/cloudaccount/components/ReadOnly'
import { getCloudaccountDocs, keySecretFields } from '@Cloudenv/views/cloudaccount/constants'
import { isRequired } from '@/utils/validate'
import createMixin from './createMixin'
import DomainProject from '../../../components/DomainProject'

export default {
  name: 'HCSO',
  components: {
    AutoSync,
    DomainProject,
    ProxySetting,
    ShareMode,
    ReadOnly,
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
      let initDomain = {
        key: this.$store.getters.userInfo.projectDomainId,
        label: this.$store.getters.userInfo.projectDomain,
      }
      const {
        domain_id,
        project_domain,
        auto_create_project: initAutoCreateProject = false,
        endpoint_domain: initEndpointDomain = '',
        region_id: initRegionId = '',
        iam: initIam = '',
        ecs: initEcs = '',
        vpc: initVpc = '',
        ims: initIms = '',
        evs: initEvs = '',
        dcs: initDcs = '',
        elb: initElb = '',
        obs: initObs = '',
        rds: initRds = '',
        nat: initNat = '',
        cts: initCts = '',
        ces: initCes = '',
        eps: initEps = '',
        sfs_turbo: initSfsTurbo = '',
        default_subnet_dns: initDefaultSubnetDns = '',
      } = this.cloneData
      if (domain_id && project_domain) {
        initDomain = {
          key: domain_id,
          label: project_domain,
        }
      }
      const decorators = {
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
        endpoint_domain: [
          'endpoint_domain',
          {
            initialValue: initEndpointDomain,
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('cloudenv.cloudaccount.hcso.endpoint_domain')]) },
            ],
          },
        ],
        default_region: [
          'default_region',
          {
            initialValue: initRegionId,
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('cloudenv.cloudaccount.hcso.default_region')]) },
            ],
          },
        ],
        iam: [
          'iam',
          {
            initialValue: initIam,
          },
        ],
        ecs: [
          'ecs',
          {
            initialValue: initEcs,
          },
        ],
        vpc: [
          'vpc',
          {
            initialValue: initVpc,
          },
        ],
        ims: [
          'ims',
          {
            initialValue: initIms,
          },
        ],
        evs: [
          'evs',
          {
            initialValue: initEvs,
          },
        ],
        dcs: [
          'dcs',
          {
            initialValue: initDcs,
          },
        ],
        elb: [
          'elb',
          {
            initialValue: initElb,
          },
        ],
        obs: [
          'obs',
          {
            initialValue: initObs,
          },
        ],
        rds: [
          'rds',
          {
            initialValue: initRds,
          },
        ],
        nat: [
          'nat',
          {
            initialValue: initNat,
          },
        ],
        cts: [
          'cts',
          {
            initialValue: initCts,
          },
        ],
        ces: [
          'ces',
          {
            initialValue: initCes,
          },
        ],
        eps: [
          'eps',
          {
            initialValue: initEps,
          },
        ],
        sfs_turbo: [
          'sfs_turbo',
          {
            initialValue: initSfsTurbo,
          },
        ],
        default_subnet_dns: [
          'default_subnet_dns',
          {
            initialValue: initDefaultSubnetDns,
          },
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
