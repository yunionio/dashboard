<template>
  <div>
    <page-header :title="$t('common_661')" :tabs="cloudEnvOptions" :current-tab.sync="cloudEnv" />
    <page-body>
      <a-form
        class="mt-3"
        :form="form.fc"
        @submit.prevent="handleSubmit"
        v-bind="formItemLayout"
        hideRequiredMark>
        <a-form-item :label="$t('network.text_205', [$t('dictionary.project')])" v-if="isAdminMode">
          <domain-project :decorators="decorators.projectDomain" :fc="form.fc" :labelInValue="false" @update:domain="domainChange" />
        </a-form-item>
        <a-form-item v-if="cloudEnv === 'public'" :label="$t('dictionary.cloudaccount')" class="mb-0">
          <a-row :gutter="8" class="w-100">
            <a-col :span="12">
              <a-form-item :wrapperCol="{ span: 24 }">
                <a-select
                  :allowClear="allowClear"
                  class="w-100"
                  style="width:100%"
                  v-decorator="decorators.brand"
                  :placeholder="$t('rules.provider')"
                  @change="brandChange"
                  showSearch>
                  <a-select-option v-for="item of brandOpts" :value="item.key" :key="item.key">{{ item.label }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :wrapperCol="{ span: 24 }">
                <base-select
                  :remote="true"
                  class="w-100"
                  :needParams="true"
                  v-decorator="decorators.account"
                  resource="cloudaccounts"
                  isDefaultSelect
                  :params="accountParams"
                  :remote-fn="q => ({ filter: `name.contains(${q})` })"
                  :select-props="{ placeholder: $t('rules.cloudaccount') }"
                  @update:item="handleAccountChange" />
              </a-form-item></a-col>
          </a-row>
        </a-form-item>
        <a-form-item v-if="cloudEnv=== 'public'" :label="$t('compute.text_15')">
          <base-select
            resource="cloudproviders"
            v-decorator="decorators.cloudprovider"
            :params="cloudproviderParams"
            :isDefaultSelect="true"
            :showSync="true"
            :select-props="{ placeholder: $t('common_588') }" />
        </a-form-item>
        <a-form-item :label="$t('network.text_717')">
          <a-select
            v-decorator="decorators.zoneType" @change="zoneTypeChangeHandle">
            <a-select-option v-for="v in zoneTypes" :value="v.value" :key="v.value">
              <div>{{ v.label }}<span class="ml-2">{{ v.desc }}</span></div>
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('network.text_156')">
          <a-input v-decorator="decorators.name" :placeholder="$t('network.text_157')" />
        </a-form-item>
        <a-form-item label="VPC" v-if="cloudEnv === 'public' && currentZoneType === 'PrivateZone'">
          <base-select
            v-decorator="decorators.vpc_ids"
            resource="vpcs"
            remote
            :params="vpcParams"
            :needParams="true"
            :labelFormat="vpcLabelFormat"
            :select-props="{ placeholder: $t('common_226'), mode: 'multiple' }"
            :remote-fn="q => ({ filter: `name.contains(${q})` })" />
        </a-form-item>
        <a-form-item :label="$t('common.description')">
          <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
        </a-form-item>
        <a-form-item :label="$t('common.text00012')" class="mb-0">
          <tag
            v-decorator="decorators.__meta__" />
        </a-form-item>
      </a-form>
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button class="mr-3" type="primary" :loading="loading" @click="handleConfirm">{{ $t('dialog.ok') }}</a-button>
        <a-button @click="cancel">{{ this.$t('dialog.cancel') }}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'
import { HYPERVISORS_MAP } from '@/constants'
import DomainProject from '@/sections/DomainProject'
import validateForm, { validate } from '@/utils/validate'
import { isValidDomain } from '@/utils/utils'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import Tag from '@/sections/Tag'
import { zoneTypes } from '../constants'

export default {
  name: 'DnsZoneCreate',
  components: {
    DomainProject,
    Tag,
  },
  data () {
    const cloudEnvOptions = getCloudEnvOptions('compute_engine_brands').filter(val => ['onpremise', 'public'].includes(val.key))
    const cloudEnv = this.$route.params?.cloudEnv || _.get(cloudEnvOptions, '[0].key')
    const zoneType = zoneTypes[0].value
    return {
      loading: false,
      cloudEnvOptions,
      cloudEnv,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.form.fd[key] = values[key]
            })
          },
        }),
        fd: {
          brand: '',
          account: '',
          cloudprovider: '',
          zoneType,
        },
      },
      decorators: {
        projectDomain: {
          project: [
            'project',
            {
              initialValue: undefined,
            },
          ],
          domain: [
            'domain',
            {
              initialValue: undefined,
            },
          ],
        },
        brand: [
          'brand',
          {
            rules: [
              { required: true, message: this.$t('rules.brand') },
            ],
          },
        ],
        account: [
          'account',
          {
            rules: [
              { required: true, message: this.$t('rules.cloudaccount') },
            ],
          },
        ],
        cloudprovider: [
          'cloudprovider',
          {
            rules: [
              { required: true, message: this.$t('common_588') },
            ],
          },
        ],
        vpc_ids: [
          'vpc_ids',
          {
            rules: [
              { required: true, message: this.$t('network.text_274') },
            ],
          },
        ],
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_157') },
              { validator: this.checkDomainHandle },
            ],
          },
        ],
        description: ['description'],
        zoneType: [
          'zoneType',
          {
            initialValue: zoneType,
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_717') },
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
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      brandOpts: [],
      domainId: '',
      currentZoneType: zoneTypes[0].value,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'capability']),
    vpcParams () {
      const params = {
        limit: 20,
        usable_vpc: true,
        scope: this.scope,
      }
      if (this.isAdminMode && this.domainId) {
        params.project_domain = this.domainId
        delete params.scope
      }
      if (this.form.fd.brand) {
        params.brand = this.form.fd.brand
      }
      return params
    },
    zoneTypes () {
      if (this.cloudEnv === 'onpremise') {
        return zoneTypes.filter(item => item.value === 'PrivateZone')
      }
      if (this.isCloudflare) {
        return zoneTypes.filter(item => item.value === 'PublicZone')
      }
      return zoneTypes
    },
    accountParams () {
      return {
        scope: this.$store.getters.scope,
        provider: this.form?.fd?.brand,
        limit: 20,
      }
    },
    cloudproviderParams () {
      return {
        scope: this.$store.getters.scope,
        read_only: false,
        cloudaccount_id: this.form?.fd?.account,
      }
    },
    isCloudflare () {
      return this.form.fd.brand === 'Cloudflare'
    },
  },
  watch: {
    cloudEnv: function (val) {
      if (val === 'onpremise') {
        this.form.fc.setFieldsValue({
          zoneType: 'PrivateZone',
        })
        this.form.fd.zoneType = 'PrivateZone'
        this.currentZoneType = 'PrivateZone'
      } else {
        this.initBrands()
      }
    },
    zoneTypes (val, oldval) {
      this.form.fc.setFieldsValue({
        zoneType: val[0].value,
      })
      this.form.fd.zoneType = val[0].value
      this.currentZoneType = val[0].value
    },
  },
  mounted () {
    if (this.cloudEnv === 'public') {
      this.initBrands()
    }
  },
  methods: {
    initBrands () {
      const ret = []
      const brands = this.capability.dns_brands.filter(key => ['Aliyun', 'Aws', 'Qcloud', 'Cloudflare'].includes(key))
      brands.map(key => {
        const target = HYPERVISORS_MAP[key.toLowerCase()]
        ret.push({ key: target.provider, label: target.label })
      })
      const brand = ret[0] ? ret[0].key : ''
      this.form.fd.brand = brand
      this.brandOpts = ret
      this.$nextTick(() => {
        this.form.fc.setFieldsValue({
          brand,
        })
      })
    },
    domainChange (domainId) {
      this.domainId = domainId
    },
    doCreate (data) {
      return new this.$Manager('dns_zones').create({ data })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const { domain, project, name, zoneType, description, cloudprovider } = values
        const data = {
          domain: domain || this.$store.getters.userInfo.project_domain,
          project: project,
          name,
          description,
          zone_type: zoneType,
          __meta__: values.__meta__,
        }
        if (this.cloudEnv === 'public') {
          data.cloudprovider_id = cloudprovider
          if (zoneType === 'PrivateZone') {
            data.vpc_ids = values.vpc_ids
          }
        }
        await this.doCreate(data)
        this.$router.push({
          name: 'DnsZone',
          params: {
            cloudEnv: this.cloudEnv,
          },
        })
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
    checkDomainHandle (rule, value, callback) {
      if (this.form.fd.zoneType === 'PublicZone') {
        if (validate(value, 'domain') === false || validate(value, 'domain').result === false) {
          callback(new Error(this.$t('network.text_178')))
        }
        if (!isValidDomain(value)) {
          callback(new Error(this.$t('network.subdomain_not_supported')))
        }
      }
      callback()
    },
    zoneTypeChangeHandle (value) {
      this.currentZoneType = value
      this.$nextTick(() => {
        this.form.fc.validateFields(['name'], { force: true })
      })
    },
    vpcLabelFormat (item) {
      if (item.manager) {
        if (item.cidr_block) {
          return <div><span class="text-color-secondary">VPC:</span> { item.name }<span>（{ item.cidr_block }）</span><span class="ml-2 text-color-secondary">{this.$t('common_711')}: { item.manager }</span></div>
        }
        return <div><span class="text-color-secondary">VPC:</span> { item.name }<span class="ml-2 text-color-secondary">{this.$t('common_711')}: { item.manager }</span></div>
      }
      return <div>{ item.name }</div>
    },
    cancel () {
      this.$router.push({
        name: 'DnsZone',
        params: {
          cloudEnv: this.cloudEnv,
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
  .steps {
    max-width: 750px;
    margin: 32px 0;
  }
</style>
