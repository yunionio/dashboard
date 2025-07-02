<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <template v-if="params.type !== 'create'">
        <dialog-selected-tips :name="$t('common_663')" :count="params.data.length" :action="params.type === 'update' ? $t('common_694') : $t('common_666')" />
        <dialog-table :data="params.data" :columns="params.columns.slice(0, 4)" />
      </template>
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('common_664')">
          <a-input v-decorator="decorators.name" :addon-after="params.detailData.name" :placeholder="$t('common_695')" />
        </a-form-item>
        <a-form-item :label="$t('network.text_160')">
          <a-select
            v-decorator="decorators.dns_type"
            @change="dnsTypeChangeHandle">
            <template v-for="v in options.dnsTypes">
              <a-select-option v-if="!(isMultiValueAnswer && v.value === 'CNAME')" :value="v.value" :key="v.value">
                {{ v.label }}
              </a-select-option>
            </template>
          </a-select>
        </a-form-item>
        <a-form-item>
          <span slot="label">
            {{ $t('network.text_152') }}
            <a-tooltip class="item" effect="dark" placement="top" v-if="isSRV">
              <a-icon type="info-circle" />
              <div slot="title">{{$t('network.text_751')}}</div>
            </a-tooltip>
          </span>
          <a-input v-decorator="decorators.dns_value" :placeholder="$t('network.text_175')" />
        </a-form-item>
        <a-form-item v-if="showProxied" :label="$t('network.proxy_status')">
          <a-switch v-decorator="decorators.proxied" :checkedChildren="$t('network.proxy_exist')" :unCheckedChildren="$t('network.just_dns')" />
        </a-form-item>
        <a-form-item>
          <span slot="label">
            {{ $t('common_665') }}
            <a-tooltip class="item" effect="dark" placement="top">
              <a-icon type="info-circle" />
              <div slot="title">{{$t('network.text_171', [300])}}</div>
            </a-tooltip>
          </span>
          <a-row>
            <a-col :span="2">
              <a-input-number v-decorator="decorators.ttl" :min="ttlRange.min" :max="ttlRange.max" />
            </a-col>
            <a-col :span="22">
              <ul class="oc-ttl d-flex">
                <li
                  class="oc-ttl-item ml-1"
                  @click="ttlClickHandle(v)"
                  v-for="v in options.ttls"
                  :value="v.value"
                  :key="v.value">
                  <a-tag color="blue">{{ v.label }}</a-tag>
                </li>
              </ul>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item v-if="isMX">
          <span slot="label">
            {{ $t('network.text_731') }}
            <a-tooltip class="item" effect="dark" placement="top">
              <a-icon type="info-circle" />
              <div slot="title">{{$t('network.text_732')}}</div>
            </a-tooltip>
          </span>
          <a-input-number v-decorator="decorators.mx_priority" :min="1" :max="50" />
        </a-form-item>
        <a-form-item v-if="isPublic && !isCloudflare" :label="$t('common_696')" class="mb-0">
          <a-row
            :gutter="4"
            class="record-list mb-3">
            <a-col :span="6">
              <a-form-item>
                <a-select v-decorator="decorators.policy_type" @change="policyTypeChangeHandle">
                  <template
                      v-for="(item, i) in policyTypeOpts">
                    <a-select-option
                      :key="i"
                      :value="item.value"
                      v-if="!(form.fd.dns_type === 'CNAME' && item.value === 'MultiValueAnswer')">
                      {{item.label}}
                    </a-select-option>
                  </template>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="18">
              <a-form-item>
                <a-input v-if="form.fd.policy_type === 'Weighted'" v-decorator="decorators.policy_txtvalue" />
                <a-cascader
                  v-decorator="decorators.policy_value_list"
                  v-else-if="isAliyunEE"
                  :options="policyValueOptions"
                  change-on-select
                  expand-trigger="hover"
                  @change="onChange" />
                <a-select v-else :disabled="form.fd.policy_type === 'Simple' || form.fd.policy_type === 'MultiValueAnswer'" v-decorator="decorators.policy_value">
                  <a-select-option
                    :key="i"
                    :value="item.value"
                    v-for="(item, i) in policyValueOpts">
                    {{item.label}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item :label="$t('compute.text_1154')" class="mb-0">
          <tag v-decorator="decorators.tag" :allowNoValue="false" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading.submit">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import validateForm, { validate } from '@/utils/validate'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import Tag from '@/sections/Tag'
import { getDnsTypes, getDnsProviders, getTtls, getPolicyValueOpts, getAliyunEEPolicyValuePath } from '../utils'
import { providers, policy_types, policy_values, aliyun_ee_policy_types } from '../constants'

export default {
  name: 'DnsRecordSetCreateDialog',
  components: {
    Tag,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const dnsTypes = getDnsTypes(this.params.detailData).filter((item) => {
      return item.value !== 'PTR'
    })
    const dnsProviders = getDnsProviders(providers, this.params.detailData)
    const ttls = getTtls(this.params.detailData)
    const initPolicyType = this.params.data ? this.params.data[0]?.policy_type || 'Simple' : 'Simple'
    const initProxied = this.params.data ? this.params.data[0]?.proxied || false : false
    let initPolicyValue = this.params.data ? this.params.data[0]?.policy_value || '' : ''

    const checkDnsValue = (rule, value, callback) => {
      if (this.form.fd.dns_type === 'A') {
        if (validate(value, 'IPv4') === false || validate(value, 'IPv4').result === false) {
          callback(new Error(this.$t('validator.IPv4')))
        } else {
          callback()
        }
      } else if (this.form.fd.dns_type === 'AAAA') {
        if (validate(value, 'IPv6') === false || validate(value, 'IPv6').result === false) {
          callback(new Error(this.$t('validator.IPv6')))
        } else {
          callback()
        }
      } else if (this.form.fd.dns_type === 'CNAME' || this.form.fd.dns_type === 'MX') {
        if (validate(value, 'domain') === false || validate(value, 'domain').result === false) {
          callback(new Error(this.$t('validator.domain')))
        } else {
          callback()
        }
      } else if (this.form.fd.dns_type === 'SRV') {
        const parts = value.split(' ')
        if (parts.length !== 4) {
          callback(new Error(this.$t('network.text_179')))
        }
        if (parts[0] < 0 || parts[0] > 65535) {
          callback(new Error(this.$t('network.text_180')))
        }
        if (parts[1] < 0 || parts[1] > 99999) {
          callback(new Error(this.$t('network.text_180')))
        }
        if (parts[2] < 0 || parts[2] > 65535) {
          callback(new Error(this.$t('network.text_180')))
        }
        if (parts[3]) {
          const domain = parts[3]
          if (validate(domain, 'domain') === false || validate(domain, 'domain').result === false) {
            callback(new Error(this.$t('network.text_180')))
          } else {
            callback()
          }
        }
      }
      callback()
    }

    const checkDnsName = (rule, value, callback) => {
      if (this.form.fd.dns_type === 'SRV') {
        const parts = value.split('.')
        if (parts.length < 2) {
          return callback(new Error(this.$t('network.text_179')))
        }
      }
      if (value !== '*' && value !== '@') {
        const valid = validate(value, 'dnsName')
        if (valid === false || valid.result === false) {
          callback(new Error(this.$t('validator.dnsName')))
        }
        if (value.startsWith('-') || value.startsWith('.') || value.endsWith('-') || value.endsWith('.')) {
          callback(new Error(this.$t('validator.dnsName')))
        }
      }
      callback()
    }

    const checkPolicyTxtValue = (rule, value, callback) => {
      const val = parseInt(value)
      if (!value) {
        callback(new Error(this.$t('network.text_733')))
      }
      if (!(/^\+?[1-9][0-9]*$/.test(value))) {
        callback(new Error(this.$t('network.text_734')))
      }
      if (val < 0 || val > 255) {
        callback(new Error(this.$t('network.text_734')))
      }
      callback()
    }

    const isAliyunEE = this.params.detailData.provider === 'Aliyun' && this.params.detailData.product_type === 'Enterprise'

    if (isAliyunEE) {
      initPolicyValue = getAliyunEEPolicyValuePath(initPolicyType, initPolicyValue).path || []
    }

    return {
      loading: {
        submit: false,
        trafficPolicy: false,
      },
      options: {
        dnsTypes,
        ttls,
        providers: dnsProviders,
        policy_types,
        policy_values,
      },
      trafficPolicies: [],
      dnsZoneCapabilityData: null,
      form: {
        fc: this.$form.createForm(this, { onValuesChange: this.onValuesChange }),
        fd: {
          provider: '',
          dns_type: 'A',
          policy_type: initPolicyType,
        },
      },
      decorators: {
        name: [
          'name',
          {
            validateTrigger: ['change', 'blur'],
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('common_695') },
              { validator: checkDnsName },
            ],
          },
        ],
        dns_type: [
          'dns_type',
          {
            initialValue: dnsTypes[0].value,
          },
        ],
        dns_value: [
          'dns_value',
          {
            validateTrigger: ['change', 'blur'],
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_175') },
              { validator: checkDnsValue },
            ],
          },
        ],
        mx_priority: [
          'mx_priority',
          {
            initialValue: 5,
          },
        ],
        ttl: [
          'ttl',
          {
            initialValue: 300,
          },
        ],
        proxied: [
          'proxied',
          {
            initialValue: initProxied,
            valuePropName: 'checked',
          },
        ],
        provider: [
          'provider',
          {
            initialValue: '',
            validateTrigger: ['change', 'blur'],
            rules: [{
              required: true,
              message: this.$t('network.text_334', [this.$t('common_283')]),
            }],
          },
        ],
        policy_type: [
          'policy_type',
          {
            initialValue: initPolicyType,
            validateTrigger: ['change', 'blur'],
            rules: [{
              required: true,
              message: this.$t('network.text_334', [this.$t('common_713')]),
            }],
          },
        ],
        policy_value: [
          'policy_value',
          {
            initialValue: !isAliyunEE ? initPolicyValue : '',
          },
        ],
        policy_value_list: [
          'policy_value_list',
          {
            initialValue: isAliyunEE ? initPolicyValue : [],
            rules: [{
              required: true,
              message: this.$t('common.tips.select', [this.$t('common_696')]),
            }],
          },
        ],
        policy_txtvalue: [
          'policy_txtvalue',
          {
            initialValue: '',
            rules: [{ validator: checkPolicyTxtValue }],
          },
        ],
        tag: [
          'tag',
          {
            initialValue: this.params?.data[0]?.metadata,
            rules: [
              { required: false, message: this.$t('cloudenv.text_451') },
              { validator: validateForm('tagName') },
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
      isAliyunEE,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'userInfo']),
    zoneType () {
      return this.params.detailData.zone_type
    },
    isPublicZone () {
      return this.zoneType === 'PublicZone'
    },
    isPublic () {
      return this.params.detailData.cloud_env === 'public'
    },
    ttlRange () {
      if (this.isPublicZone) {
        return {
          min: 60,
          max: 86400,
        }
      } else {
        return {
          min: 5,
          max: 86400,
        }
      }
    },
    isSRV () {
      return this.form.fd.dns_type === 'SRV'
    },
    isMX () {
      return this.form.fd.dns_type === 'MX'
    },
    isUpdate () {
      return this.params.type === 'update'
    },
    isMultiValueAnswer () {
      if (this.trafficPolicies && this.trafficPolicies.length > 0) {
        const types = this.trafficPolicies.map(v => v.policy_type)
        return types.includes('MultiValueAnswer')
      }
      return false
    },
    exsitProviders () {
      return this.trafficPolicies.map(v => v.provider)
    },
    policyTypeOpts () {
      if (this.isAliyunEE) {
        return aliyun_ee_policy_types
      }
      return this.getPublicTypes(this.params.detailData.provider, this.zoneType)
    },
    policyValueOpts () {
      return this.getPublicValues(this.params.detailData.provider, this.form.fd.policy_type)
    },
    isCloudflare () {
      return this.params.detailData.provider === 'Cloudflare'
    },
    showProxied () {
      return this.isCloudflare && ['A', 'AAAA', 'CNAME'].includes(this.form.fd.dns_type)
    },
    policyValueOptions () {
      if (!this.isAliyunEE) return []
      return getPolicyValueOpts(this.form.fd.policy_type)
    },
  },
  created () {
    this.recordsetManager = new this.$Manager('dnsrecords')
  },
  async mounted () {
    await this.fetchTrafficPolicies()
    this.backfillData()
  },
  methods: {
    doCreate (data) {
      if (this.params.type === 'create') {
        return this.recordsetManager.create({ data })
      } else if (this.isUpdate) {
        return this.recordsetManager.update({ id: this.params.data[0].id, data })
      } else if (this.params.type === 'clone') {
        return this.recordsetManager.create({ data })
      }
    },
    async handleConfirm () {
      this.loading.submit = true
      try {
        const values = await this.form.fc.validateFields()
        const newValues = this.generateData(values)
        await this.doCreate(newValues)
        this.loading.submit = false
        this.params.refresh && this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading.submit = false
      }
    },
    policyTypeChangeHandle (val) {
      this.$nextTick(() => {
        if (this.isAliyunEE) {
          this.form.fc.setFieldsValue({
            policy_value_list: [],
          })
          this.form.fc.setFieldsValue({
            policy_txtvalue: '',
          })
        } else if (this.policyValueOpts.length > 0) {
          this.form.fc.setFieldsValue({
            policy_value: this.policyValueOpts[0].value,
          })
          this.form.fc.setFieldsValue({
            policy_txtvalue: this.policyValueOpts[0].value,
          })
        } else {
          this.form.fc.setFieldsValue({
            policy_value: '',
          })
          this.form.fc.setFieldsValue({
            policy_txtvalue: '',
          })
        }
      })
    },
    generateData (values) {
      const { name, dns_type, dns_value, ttl, policy_type, policy_value, policy_value_list = [], policy_txtvalue, mx_priority, proxied } = values
      const { id } = this.params.detailData
      const data = {
        name,
        dns_type,
        dns_value,
        ttl,
        dns_zone_id: id,
        enabled: true,
        __meta__: values.tag,
      }
      if (this.isMX) {
        data.mx_priority = mx_priority
      }
      if (this.isPublic && !this.isCloudflare) {
        data.policy_type = policy_type
        if (this.isAliyunEE) {
          data.policy_value = policy_value_list.length ? policy_value_list[policy_value_list.length - 1] : ''
        } else {
          data.policy_value = policy_type === 'Weighted' ? policy_txtvalue : policy_value
        }
      }
      if (this.isCloudflare && this.showProxied) {
        data.proxied = proxied
      }
      return data
    },
    backfillData () {
      if (this.isUpdate || this.params.type === 'clone') {
        this._updateFormValue(this.params.data[0])
      }
    },
    _updateFormValue (val) {
      const { name, dns_type, dns_value, ttl, mx_priority, policy_type, policy_value } = val
      this.$nextTick(() => {
        let _name = ''
        if (this.isUpdate) {
          _name = name
        }
        const data = {
          name: _name,
          dns_type,
          dns_value,
          ttl,
          policy_type,
        }
        if (dns_type === 'MX') {
          data.mx_priority = mx_priority
        }
        if (policy_type === 'Weighted') {
          data.policy_txtvalue = policy_value
        } else if (policy_type !== 'MultiValueAnswer' && policy_type !== 'Simple') {
          data.policy_value = policy_value
        }
        this.form.fc.setFieldsValue(data)
      })
    },
    ttlClickHandle (v) {
      this.form.fc.setFieldsValue({
        ttl: v.value,
      })
    },
    fetchTrafficPolicies () {
      this.loading.trafficPolicy = true
      return new this.$Manager('dns_zones/capability')
        .list({ params: { scope: this.scope } })
        .then((res) => {
          this.dnsZoneCapabilityData = res.data
          this.loading.trafficPolicy = false
        })
        .catch((err) => {
          this.loading.trafficPolicy = false
          throw err
        })
    },
    getPublicTypes (provider, zoneType) {
      let types = []
      if (!this.dnsZoneCapabilityData) return []
      if (!provider) return []
      if (this.dnsZoneCapabilityData[provider] && this.dnsZoneCapabilityData[provider].policy_types) {
        types = this.dnsZoneCapabilityData[provider].policy_types[zoneType] || []
        types = types.filter((item) => {
          if (provider === 'Qcloud') {
            return item !== 'Weighted'
          }
          if (provider === 'Aws') {
            return item !== 'Failover'
          }
          return true
        })
        return types.map((item) => {
          return {
            label: this.$te(`network.dns.${item.toLowerCase()}`) ? this.$t(`network.dns.${item.toLowerCase()}`) : item,
            value: item,
          }
        })
      }
      return []
    },
    getPublicValues (provider, type) {
      let values = []
      if (!this.dnsZoneCapabilityData) return []
      if (this.dnsZoneCapabilityData[provider] && this.dnsZoneCapabilityData[provider].policy_values) {
        values = this.dnsZoneCapabilityData[provider].policy_values[type] || []
        values = Array.from(new Set(values))
        return values.map((item) => {
          return {
            label: this.$te(`network.dns.${item.toLowerCase()}`) ? this.$t(`network.dns.${item.toLowerCase()}`) : item,
            value: item,
          }
        })
      }
      return []
    },
    onValuesChange (props, values) {
      Object.keys(values).forEach((key) => {
        if (['dns_type', 'policy_type'].includes(key)) {
          this.form.fd[key] = values[key]
        }
      })
    },
    dnsTypeChangeHandle () {
      this.$nextTick(() => {
        this.form.fc.validateFields(['dns_value'], { force: true })
      })
    },
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
  },
}
</script>
<style lang="scss" scoped>
.oc-ttl {
  list-style: none;
  .oc-ttl-item {
    .ant-tag {
      cursor: pointer;
    }
  }
}
</style>
