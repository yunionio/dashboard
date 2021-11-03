<template>
  <a-spin :spinning="loading">
    <page-header :title="title" />
    <page-body>
      <template v-if="isUpdate">
        <a-alert class="mb-2" :message="$t('system.text_230')" />
      </template>
      <template v-if="isUpdate">
        <idp-detail-table :data="[detailData]" />
      </template>
      <a-form :form="form.fc" v-bind="formItemLayout">
        <template v-if="!isUpdate">
          <template v-if="isAdmin">
            <a-form-item :label="$t('common_548')">
              <a-radio-group v-model="isShowDomain">
                <a-radio-button :value="false">{{$t('system.text_15')}}</a-radio-button>
                <a-radio-button :value="true">{{$t('dictionary.domain')}}</a-radio-button>
              </a-radio-group>
            </a-form-item>
            <a-form-item v-if="isAdmin && isShowDomain" :label="$t('common_547', [$t('dictionary.domain')])">
              <base-select
                v-decorator="decorators.project_domain"
                @change="handleDomain"
                resource="domains"
                filterable
                version="v1"
                :select-props="{
                  placeholder: $t('common_515', [$t('dictionary.domain')])
                }" />
            </a-form-item>
          </template>
          <a-form-item v-else :label="$t('common_566', [$t('dictionary.domain')])">
            {{projectDomain}}
          </a-form-item>
          <a-form-item :label="$t('common_186')">
            <a-input v-decorator="decorators.name" :placeholder="$t('common_549')" />
          </a-form-item>
          <a-form-item :label="$t('system.text_204')">
            <a-radio-group @change="({ target })=> driverChange(target.value)" v-decorator="decorators.driver">
              <a-radio-button v-for="(item, key) of templateOptions" :key="key" :value="key">
                {{key}}
              </a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item :label="$t('common_550')">
            <a-radio-group  v-decorator="decorators.template" @change="handleTemplateChange">
              <template v-for="(item) of templateOptions[form.fd.driver]">
                <a-radio-button
                  :value="item.key"
                  :key="item.key">{{ item.label }}</a-radio-button>
              </template>
            </a-radio-group>
            <template v-if="docLink" #extra>
              {{$t('common_709', [templateData.label])}}
              <help-link :href="docLink">{{$t('common_386')}}</help-link>
            </template>
          </a-form-item>
          <template v-if="isLdap && (form.fd.template === 'msad_one_domain' || form.fd.template === 'openldap_one_domain')">
            <ldap-advanced
              :is-common="isCommon"
              :fd="form.fd"
              :fc="form.fc"
              :template-data="templateData"
              :offset-wrapper-col="offsetWrapperCol" />
          </template>
        </template>
        <component
          :is="form.fd.template"
          :decorators="decorators[form.fd.template]"
          :fd="form.fd"
          :offset-wrapper-col="offsetWrapperCol"
          :fc="form.fc" />
        <template v-if="!isUpdate">
          <a-form-item v-if="isLdap" :label="$t('system.text_223')" :extra="$t('system.text_224')">
            <a-radio-group v-decorator="decorators.disable_user_on_import">
              <a-radio-button :value="false">{{$t('status.enabled.true')}}</a-radio-button>
              <a-radio-button :value="true">{{$t('status.enabled.false')}}</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <advanced
            v-if="!isLdap"
            :is-common="isCommon"
            :fd="form.fd"
            :fc="form.fc"
            :template-data="templateData"
            :offset-wrapper-col="offsetWrapperCol" />
        </template>
      </a-form>
    </page-body>
    <page-footer>
      <template v-slot:right>
        <a-button type="primary" size="large" :loading="submiting" @click="handleSubmit">{{ $t('dialog.ok') }}</a-button>
        <a-button class="ml-2" size="large" @click="handleCancel">{{ $t('dialog.cancel') }}</a-button>
      </template>
    </page-footer>
  </a-spin>
</template>

<script>
import * as R from 'ramda'
import jumper from '@/mixins/jumper'
import { resolveValueChangeField } from '@/utils/common/ant'
import { docs } from '../constants'
import IDPDetailTable from '../components/DetailTable'
import CAS from './CAS'
import MSADMulti from './MSADMulti'
import MSADOne from './MSADOne'
import OpenLdapOne from './OpenLdapOne'
import SAML from './SAML'
import AzureADSAML from './AzureADSAML'
import OIDC from './OIDC'
import Google from './Google'
import Github from './Github'
import AzureOidc from './AzureOidc'
import Feishu from './Feishu'
import Dingtalk from './Dingtalk'
import Wechat from './Wechat'
import Advanced from './Advanced'
import LdapAdvanced from './LdapAdvanced'

export default {
  name: 'IDPEdit',
  components: {
    Advanced,
    msad_one_domain: MSADOne,
    msad_multi_domain: MSADMulti,
    openldap_one_domain: OpenLdapOne,
    cas: CAS,
    saml: SAML,
    azure_ad_saml: AzureADSAML,
    Oidc: OIDC,
    google_oidc: Google,
    github_oidc: Github,
    azure_oidc: AzureOidc,
    feishu_oauth2: Feishu,
    dingtalk_oauth2: Dingtalk,
    qywechat_oauth2: Wechat,
    'idp-detail-table': IDPDetailTable,
    LdapAdvanced,
  },
  mixins: [jumper],
  data () {
    const templateInitialValue = 'msad_one_domain'
    const driverInitialValue = 'LDAP'
    return {
      loading: false,
      submiting: false,
      isShowDomain: false,
      isAdmin: this.$store.getters.isAdminMode,
      isDomainMode: this.$store.getters.isDomainMode,
      projectDomain: this.$store.getters.userInfo.projectDomain,
      projectDomainId: this.$store.getters.userInfo.projectDomainId,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            this.$nextTick(() => {
              const newField = resolveValueChangeField(values)
              R.forEachObjIndexed((item, key) => {
                this.$set(this.form.fd, key, item)
              }, newField)
            })
          },
        }),
        fd: {
          template: templateInitialValue,
          driver: driverInitialValue,
        },
      },
      decorators: {
        driver: [
          'driver',
          {
            initialValue: driverInitialValue,
          },
        ],
        name: [
          'name',
          {
            rules: [
              { required: true, message: this.$t('system.text_168') },
            ],
          },
        ],
        project_domain: [
          'project_domain',
          {
            rules: [
              { required: true, message: this.$t('common_523', [this.$t('dictionary.domain')]) },
            ],
          },
        ],
        template: [
          'template',
          {
            initialValue: templateInitialValue,
          },
        ],
        disable_user_on_import: [
          'disable_user_on_import',
          {
            initialValue: false,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
          xxl: {
            span: 20,
          },
        },
        labelCol: {
          span: 5,
          xxl: {
            span: 4,
          },
        },
      },
      offsetWrapperCol: {
        wrapperCol: {
          offset: 5,
          xxl: {
            offset: 4,
          },
        },
      },
      detailData: {},
    }
  },
  computed: {
    id () {
      return this.$route.params.id
    },
    isUpdate () {
      return !!this.id
    },
    isLdap () {
      return this.form.fd.driver === 'LDAP'
    },
    title () {
      if (this.isUpdate) return this.$t('system.text_563')
      return this.$t('system.text_562')
    },
    templateData () {
      const { driver, template } = this.form.fd
      if (this.templateOptions && this.templateOptions[driver]) {
        return this.templateOptions[driver].find(({ key }) => key === template)
      }
      return {}
    },
    // 是否为通用模版
    isCommon () {
      const { template } = this.form.fd
      return ['oidc', 'saml', 'cas'].indexOf(template) > -1
    },
    templateOptions () {
      let templateOptions = {}
      const idpDrivers = this.$t('idpDrivers')
      Object.keys(idpDrivers).forEach(key => {
        templateOptions[key] = []
        Object.values(idpDrivers[key]).forEach(tkey => {
          templateOptions[key].push({
            label: this.$t(`idpTmplTitles.${tkey}`),
            key: tkey,
          })
        })
      })
      // 认证源归属为域时，删除ldap多域导入选项
      if (this.isShowDomain) {
        const index = R.findIndex(R.propEq('key', 'msad_multi_domain'))(templateOptions.LDAP)
        templateOptions.LDAP = R.remove(index, 1, templateOptions.LDAP)
      }
      // 开源只保留LDAP
      if (!this.$appConfig.isPrivate) {
        templateOptions = { LDAP: templateOptions.LDAP }
      }
      return templateOptions
    },
    docLink () {
      return this.templateData && docs(this.$store.getters.scope)[this.templateData.key]
    },
  },
  watch: {
    isShowDomain (val) {
      if (val && this.form.fd.template === 'msad_multi_domain') {
        this.form.fc.setFieldsValue({
          template: 'msad_one_domain',
        })
      }
    },
  },
  destroyed () {
    this.manager = null
  },
  created () {
    this.manager = new this.$Manager('identity_providers', 'v1')
    if (this.isUpdate) {
      this.fetchInfo()
    } else {
      this.driverChange()
    }
  },
  methods: {
    handleDomain (domainId) {
      this.form.fc.setFieldsValue({
        target_domain: domainId,
      })
    },
    scopesFormat (value, f) {
      if (value) {
        if (f) {
          return value.join(',')
        }
        return value.split(',')
      }
      return f ? '' : []
    },
    async fetchDetail () {
      try {
        const { data } = await this.manager.get({
          id: this.id,
          params: {
            detail: true,
          },
        })
        this.detailData = data
        this.form.fc.getFieldDecorator('template', { preserve: true })
        this.form.fc.setFieldsValue({
          template: data.template || data.driver,
        })
      } catch (err) {
        throw err
      }
    },
    async fetchConfig () {
      try {
        const { data = {} } = await this.manager.getSpecific({
          id: this.id,
          spec: 'config',
        })
        const { config = {} } = data
        await this.$nextTick()
        const key = Object.keys(config)[0]
        const params = {
          ...config[key],
        }
        if (params.scopes) {
          params.scopes = this.scopesFormat(params.scopes, true)
        }
        if (params.template === 'qywechat_oauth2') {
          const [corp_id, agent_id] = params.app_id.split('/')
          params.corp_id = corp_id
          params.agent_id = agent_id
          delete params.app_id
        }
        this.form.fc.getFieldDecorator('driver', { preserve: true })
        this.form.fc.setFieldsValue({
          driver: key,
          ...params,
        })
      } catch (err) {
        throw err
      }
    },
    async fetchInfo () {
      this.loading = true
      try {
        await this.fetchDetail()
        await this.fetchConfig()
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
    doCreate (values) {
      const { name, template, driver, target_domain, project_domain, auto_create_user, ...rest } = values
      const data = {
        name,
        driver: driver.toLowerCase(),
        target_domain: this.isDomainMode ? this.projectDomainId : target_domain,
        owner_domain_id: this.isDomainMode ? this.projectDomainId : project_domain,
        auto_create_user,
        config: {
          [driver.toLowerCase()]: rest,
        },
      }
      // 如果是cas类型，则不传递template参数
      if (!this.isCommon) {
        data.template = template
      }
      return this.manager.create({ data })
    },
    doUpdate (values) {
      const { driver, ...rest } = values
      return this.manager.performAction({
        id: this.id,
        action: 'config',
        data: {
          action: 'update',
          config: {
            [driver]: {
              ...rest,
            },
          },
        },
      })
    },
    async getValues () {
      try {
        const values = await this.form.fc.validateFields()
        const { template } = values
        if (template === 'qywechat_oauth2') {
          const { corp_id, agent_id } = values
          values.app_id = `${corp_id}/${agent_id}`
          delete values.corp_id
          delete values.agent_id
        }
        return values
      } catch (err) {
        throw err
      }
    },
    async handleSubmit () {
      this.submiting = true
      try {
        const values = await this.getValues()
        if (this.isUpdate) {
          await this.doUpdate(values)
        } else {
          await this.doCreate(values)
        }
        this.handleCancel()
      } catch (error) {
        throw error
      } finally {
        this.submiting = false
      }
    },
    handleCancel () {
      this.jumpTo('@idp')
    },
    driverChange (driver = 'LDAP') {
      const { fc } = this.form
      if (driver === 'LDAP') {
        fc.getFieldDecorator('auto_create_user', { preserve: true, valuePropName: 'checked' })
      }
      fc.setFieldsValue({
        template: this.templateOptions[driver][0].key,
        auto_create_user: driver === 'LDAP',
      })
    },
    async handleTemplateChange ({ target: { value } }) {
      const { fc } = this.form
      const values = fc.getFieldsValue(['driver', 'name', 'domain_id', 'auto_create_user', 'target_domain', 'project_domain'])
      fc.resetFields()
      this.form.fd = {}
      await this.$nextTick()
      values.template = value
      fc.setFieldsValue(values)
    },
  },
}
</script>
