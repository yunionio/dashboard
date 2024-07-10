<template>
  <div>
    <a-form :form="form.fc" v-bind="formLayout">
      <a-alert class="my-2" banner>
        <template slot="message">{{ $t('cloudenv.vmware.message') }}<help-link :href="vmDocLink">{{ $t('cloudenv.vmware.message.doc') }}</help-link></template>
      </a-alert>
      <a-form-item :label="$t('cloudenv.text_95')">
        <a-input v-decorator="decorators.name" :placeholder="$t('cloudenv.text_190')" />
      </a-form-item>
      <a-form-item :label="$t('common.description')">
        <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.text_10')" class="mb-0">
        <cloudregion-zone
          :zone-params="zoneParams"
          :cloudregion-params="cloudregionParams"
          :decorator="decorators.cloudregionZone"
          filterBrandResource="compute_engine" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.text_264')" :extra="this.$t('common_572')">
        <a-input v-decorator="decorators.host" />
      </a-form-item>
      <a-form-item :label="$t('cloudenv.text_266')">
        <a-input v-decorator="decorators.port" />
      </a-form-item>
      <a-form-item :label="keySecretField.label.k">
        <a-input v-decorator="decorators.username" :placeholder="keySecretField.placeholder.k" />
        <div slot="extra">
           <span class="mr-3">{{$t('cloudenv.text_267')}}</span>
           {{$t('cloudenv.text_236', [keySecretField.text, keySecretField.label.k])}}
           <help-link :href="docs[provider.toLowerCase()]">{{$t('cloudenv.text_237')}}</help-link>
        </div>
      </a-form-item>
      <a-form-item :label="keySecretField.label.s">
        <a-input-password v-decorator="decorators.password" :placeholder="keySecretField.placeholder.s" />
      </a-form-item>
      <domain-project :fc="form.fc" :form-layout="formLayout" :decorators="{ project: decorators.project, domain: decorators.domain, auto_create_project: decorators.auto_create_project }" />
      <blocked-resources :decorators="{ isOpenBlockedResources: decorators.isOpenBlockedResources, blockedResources: decorators.blockedResources }" />
      <proxy-setting :fc="form.fc" :fd="form.fd" ref="proxySetting" />
      <auto-sync :fc="form.fc" :form-layout="formLayout" />
      <share-mode :fd="form.fd" />
    </a-form>
  </div>
</template>

<script>
import AutoSync from '@Cloudenv/views/cloudaccount/components/AutoSync'
import ProxySetting from '@Cloudenv/views/cloudaccount/components/ProxySetting'
import ShareMode from '@Cloudenv/views/cloudaccount/components/ShareMode'
import { getCloudaccountDocs, keySecretFields } from '@Cloudenv/views/cloudaccount/constants'
import CloudregionZone from '@/sections/CloudregionZone'
import { isRequired } from '@/utils/validate'
import { getDocsUrl } from '@/utils/utils'
import createMixin from './createMixin'
import DomainProject from '../../../components/DomainProject'

export default {
  name: 'VMwareCreate',
  components: {
    AutoSync,
    DomainProject,
    ProxySetting,
    ShareMode,
    CloudregionZone,
  },
  provide () {
    return {
      form: this.form,
    }
  },
  mixins: [createMixin],
  data () {
    const keySecretField = keySecretFields[this.provider.toLowerCase()]
    return {
      baseDocURL: getDocsUrl(this.$store.getters.scope),
      docs: getCloudaccountDocs(this.$store.getters.scope),
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
        host: [
          'host',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('cloudenv.text_268') },
              { validator: this.$validate(['domain', 'IPv4'], true, 'some'), trigger: ['blur', 'change'], message: this.$t('cloudenv.text_269') },
            ],
          },
        ],
        port: [
          'port',
          {
            initialValue: 443,
            rules: [
              { type: 'number', min: 0, max: 65535, message: this.$t('cloudenv.text_270'), trigger: 'blur', transform: (v) => parseFloat(v) },
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
        cloudregionZone: {
          cloudregion: [
            'cloudregion',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { validator: isRequired(), message: this.$t('compute.text_212') },
              ],
            },
          ],
          zone: [
            'zone',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { validator: isRequired(), message: this.$t('compute.text_213') },
              ],
            },
          ],
        },
      },
      keepAliveFields: true,
    }
  },
  computed: {
    vmDocLink () {
      return `${this.baseDocURL}function_principle/multicloud/cloudaccounts/vmware_net/`
    },
    cloudregionParams () {
      return {
        cloud_env: 'onpremise',
        // usable: true,
        show_emulated: false,
        scope: this.$store.getters.scope,
      }
    },
    zoneParams () {
      return {
        // usable: true,
        show_emulated: false,
        order_by: 'created_at',
        order: 'asc',
        scope: this.$store.getters.scope,
      }
    },
  },
}
</script>
