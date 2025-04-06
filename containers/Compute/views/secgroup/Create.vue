<template>
  <div>
    <page-header :title="$t('compute.text_189')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body need-margin-bottom>
      <a-form class="mt-3" :form="form.fc" @submit.prevent="handleSubmit" v-bind="formItemLayout" hideRequiredMark>
        <a-form-item :label="$t('network.text_205', [$t('dictionary.project')])" class="mt-3" v-bind="formItemLayout">
          <domain-project :fc="form.fc" :decorators="{ project: decorators.project, domain: decorators.domain }" @update:domain="handleDomainChange" />
        </a-form-item>
        <a-form-item :label="$t('network.text_21')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
        </a-form-item>
        <a-form-item :label="$t('common.description')" v-bind="formItemLayout">
          <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
        </a-form-item>
        <area-selects
          class="mb-0"
          ref="areaSelects"
          :wrapperCol="formItemLayout.wrapperCol"
          :labelCol="formItemLayout.labelCol"
          :names="areaselectsName"
          :providerParams="providerParams"
          :cloudregionParams="cloudregionParams"
          :isRequired="true"
          filterBrandResource="security_group"
          @change="handleRegionChange" />
        <a-form-item label="VPC" v-bind="formItemLayout" v-if="regionId !== 'default'">
          <base-select
            v-decorator="decorators.vpc"
            resource="vpcs"
            :params="vpcParams"
            :isDefaultSelect="true"
            :needParams="true"
            @change="vpcChange"
            :item.sync="curVpc"
            :labelFormat="vpcLabelFormat"
            :select-props="{ placeholder: $t('common_226') }" />
        </a-form-item>
        <a-form-item :label="$t('common.text00012')" class="mb-0">
          <tag
            v-decorator="decorators.__meta__" />
        </a-form-item>
        <page-footer>
          <template v-slot:right>
            <a-button type="primary" html-type="submit" class="ml-3" :loading="submiting">{{$t('network.text_30')}}</a-button>
            <a-button class="ml-3" @click="() => $router.back()">{{$t('common.cancel')}}</a-button>
          </template>
        </page-footer>
      </a-form>
    </page-body>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import validateForm, { isRequired } from '@/utils/validate'
import { Manager } from '@/utils/manager'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import DomainProject from '@/sections/DomainProject'
import AreaSelects from '@/sections/AreaSelects'
import i18n from '@/locales'
import { HYPERVISORS_MAP } from '@/constants'
import Tag from '@/sections/Tag'

export default {
  name: 'SecgroupCreate',
  components: {
    DomainProject,
    AreaSelects,
    Tag,
  },
  data () {
    const cloudEnvOptions = getCloudEnvOptions('security_group_brands', true)
    const queryType = this.$route.query.type
    let cloudEnv = queryType === 'idc' ? 'onpremise' : this.$route.query.type
    let routerQuery = this.$route.query.type
    if (!cloudEnvOptions.find(val => val.key === cloudEnv)) {
      cloudEnv = cloudEnvOptions[0].key
      routerQuery = cloudEnv === 'onpremise' ? 'idc' : cloudEnv
    }
    return {
      submiting: false,
      cloudEnvOptions,
      cloudEnv,
      routerQuery,
      form: {
        fc: this.$form.createForm(this, { onValuesChange: this.handleValuesChange }),
        fd: {},
      },
      guestIpPrefixValidateStatus: '',
      guestIpPrefixHelp: '',
      formItemLayout: {
        wrapperCol: {
          md: { span: 18 },
          xl: { span: 20 },
          xxl: { span: 22 },
        },
        labelCol: {
          md: { span: 6 },
          xl: { span: 4 },
          xxl: { span: 2 },
        },
      },
      decorators: {
        domain: [
          'domain',
          {
            rules: [
              { validator: isRequired(), message: i18n.t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            rules: [
              { validator: isRequired(), message: i18n.t('rules.project'), trigger: 'change' },
            ],
          },
        ],
        name: [
          'name',
          {
            initialValue: '',
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_116') },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        description: ['description'],
        vpc: [
          'vpc',
          {
            rules: [
              { required: true, message: this.$t('network.text_274') },
            ],
          },
        ],
        __meta__: [
          '__meta__',
          {
            rules: [
              { validator: validateForm('tagName') },
            ],
          },
        ],
      },
      show: true,
      regionProvider: '',
      regionId: '',
      project_domain: '',
      vpcId: '',
      curVpc: null,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'scope', 'userInfo']),
    vpcParams () {
      const params = {
        limit: 0,
        usable_vpc: true,
        scope: this.scope,
        cloudregion_id: this.regionId,
      }
      if (this.cloudEnv === 'private') {
        params.show_emulated = true
      }
      if (this.isAdminMode) {
        params.project_domain = this.project_domain
        delete params.scope
      }
      if (!this.regionId) return {}
      return params
    },
    cloudregionParams () {
      const params = {
        scope: this.scope,
        limit: 0,
        show_emulated: true,
      }
      if (this.cloudEnv === 'private') {
        params.is_private = true
        params.usable_vpc = true
      } else if (this.cloudEnv === 'public') {
        params.is_public = true
        params.usable_vpc = true
      } else {
        params.is_on_premise = true
      }
      if (this.isAdminMode) {
        params.project_domain = this.project_domain
        delete params.scope
      }
      return params
    },
    areaselectsName () {
      if (this.cloudEnv === 'private' || this.cloudEnv === 'onpremise') {
        return ['cloudregion']
      }
      return ['provider', 'cloudregion']
    },
    providerParams () {
      return {
        cloud_env: 'public',
        usable: false,
        usable_vpc: true,
        project_domain: this.form.fd.domain?.key,
      }
    },
  },
  provide () {
    return {
      form: this.form,
    }
  },
  watch: {
    cloudEnv (newValue) {
      this.$refs.areaSelects.fetchs(this.areaselectsName)
      if (newValue === 'private') {
        this.show = false
        this.isGroupGuestIpPrefix = false
      } else if (newValue === 'public') {
        this.show = false
        this.isGroupGuestIpPrefix = false
      } else {
        this.show = true
        this.isGroupGuestIpPrefix = true
      }
    },
  },
  created () {
  },
  methods: {
    handleValuesChange (props, values) {
      this.form.fd = {
        ...this.form.fd,
        ...values,
      }
    },
    handleDomainChange (val) {
      this.project_domain = val.key
    },
    handleRegionChange (data) {
      const { provider, cloudregion } = data
      if (data.hasOwnProperty('provider')) {
        if (provider) {
          this.regionProvider = provider.id || provider
        } else {
          this.regionProvider = ''
          this.regionId = ''
        }
      }
      if (data.hasOwnProperty('cloudregion')) {
        if (cloudregion) {
          this.regionId = cloudregion.id || cloudregion
        }
      }
    },
    vpcChange (vpcId) {
      this.vpcId = vpcId
    },
    vpcLabelFormat (item) {
      if (this.cloudEnv === 'public' || this.regionProvider === HYPERVISORS_MAP.hcso.provider || this.regionProvider === HYPERVISORS_MAP.hcs.provider) {
        if (item.manager) {
          if (item.cidr_block) {
            return (<div>{ item.name }<span v-if="item.cidr_block">（{ item.cidr_block }）</span><span class="ml-2 text-color-secondary">{ this.$t('common.cloudprovider_1var', [item.manager]) }</span></div>)
          }
          return (<div>{ item.name }<span class="ml-2 text-color-secondary">{ this.$t('common.cloudprovider_1var', [item.manager]) }</span></div>)
        }
      } else if (this.cloudEnv === 'onpremise') {
        if (item.cidr_block) {
          return (<div>{ item.name }<span v-if="item.cidr_block">（{ item.cidr_block }）</span></div>)
        }
        if (item.id === 'default') return (<div>{ item.name }<span v-if="item.cidr_block">（{this.$t('common.text00047')}）</span></div>)
      }
      return (<div>{ item.name }</div>)
    },
    genData (values) {
      const ret = {
        name: values.name,
        description: values.description,
        vpc: values.vpc,
        __meta__: values.__meta__,
      }
      if (!this.isAdminMode && !this.isDomainMode) {
        ret.project_id = this.userInfo.projectId
      } else {
        ret.project_id = values.project?.key
      }
      return ret
    },
    clearGuestIpPrefixError () {
      this.guestIpPrefixValidateStatus = ''
      this.guestIpPrefixHelp = ''
    },
    async handleSubmit () {
      const ListPath = this.$router.resolve(this.$route.path)
      try {
        const values = await this.form.fc.validateFields()
        this.submiting = true
        const data = this.genData(values)
        const manager = new Manager('secgroups')
        await manager.create({ data })
        this.$router.push({ path: ListPath.resolved.matched[0].path })
      } catch (error) {
        throw error
      } finally {
        this.submiting = false
      }
    },
    filterOption (input, option) {
      const lastIdx = option.componentOptions.children.length - 1
      return (
        option.componentOptions.children[lastIdx].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
  },
}
</script>
