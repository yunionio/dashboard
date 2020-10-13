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
              <div slot="title">格式为：优先级、空格、权重、空格、端口、空格、主机名，5 0 5269 example.com</div>
            </a-tooltip>
          </span>
          <a-input v-decorator="decorators.dns_value" :placeholder="$t('network.text_175')" />
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
        <a-form-item :label="$t('common_696')">
          <a-row
            :gutter="4"
            :key="item.key"
            class="record-list mb-3"
            v-for="(item, idx) in trafficPolicies">
            <a-col :span="8">
              <a-form-item>
                <a-select v-decorator="decorators.provider(item.key)" disabled>
                  <a-select-option
                    :key="i"
                    :value="item.value"
                    v-for="(item, i) in item.providers">
                    {{item.label}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item>
                <a-select v-decorator="decorators.policy_type(item.key)" @change="(val) => policyTypeChangeHandle(val, item)">
                  <template
                      v-for="(item, i) in item.policy_types">
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
            <a-col :span="6">
              <a-form-item>
                <a-input v-if="item.policy_type === 'Weighted'" v-decorator="decorators.policy_txtvalue(item.key)" />
                <a-select v-else :disabled="item.policy_type === 'Simple' || item.policy_type === 'MultiValueAnswer'" v-decorator="decorators.policy_value(item.key)">
                  <a-select-option
                    :key="i"
                    :value="item.value"
                    v-for="(item, i) in item.policy_values">
                    {{item.label}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="2">
              <a-button v-show="!item.isHiddenDelete" shape="circle" icon="minus" size="small" @click="() => remove(item.key, idx)" class="mt-2" />
            </a-col>
          </a-row>
          <div class="d-flex align-items-center mt-1" v-if="options.providers.length > trafficPolicies.length">
            <a-spin v-if="loading.trafficPolicy" />
            <template v-else>
              <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
              <a-button type="link" @click="add">{{$t('common_697')}}</a-button>
            </template>
          </div>
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
import { providers, policy_types, policy_values } from '../constants'
import { getDnsTypes, getDnsProviders, getTtls } from '../utils'
import { uuid } from '@/utils/utils'
import { validate } from '@/utils/validate'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'DnsRecordSetCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const dnsTypes = getDnsTypes(this.params.detailData)
    const dnsProviders = getDnsProviders(providers, this.params.detailData)
    const ttls = getTtls(this.params.detailData)

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
          dns_type: 'A',
          policy_type: '',
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
        provider: (k) => ([
          `provider[${k}]`,
          {
            initialValue: '',
            validateTrigger: ['change', 'blur'],
            rules: [{
              required: true,
              message: this.$t('network.text_334', [this.$t('common_283')]),
            }],
          },
        ]),
        policy_type: (k) => ([
          `policy_type[${k}]`,
          {
            initialValue: '',
            validateTrigger: ['change', 'blur'],
            rules: [{
              required: true,
              message: this.$t('network.text_334', [this.$t('common_713')]),
            }],
          },
        ]),
        policy_value: (k) => ([
          `policy_value[${k}]`,
          {
            initialValue: '',
          },
        ]),
        policy_txtvalue: (k) => ([
          `policy_txtvalue[${k}]`,
          {
            initialValue: '',
            rules: [{ validator: checkPolicyTxtValue }],
          },
        ]),
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
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
      if (this.form.fd.policy_type) {
        const types = Object.values(this.form.fd.policy_type)
        return types.includes('MultiValueAnswer')
      }
      return false
    },
  },
  created () {
    this.recordsetManager = new this.$Manager('dns_recordsets')
  },
  async mounted () {
    await this.fetchTrafficPolicies()
    this.backfillData()
  },
  methods: {
    add (val) {
      const uid = uuid()
      const provider = this.form.fc.getFieldsValue().provider || {}
      const providerValues = Object.values(provider)
      const _providers = this.options.providers.filter(item => !providerValues.includes(item.value))
      const _provider = val.provider || _providers[0].value
      const policy_types = this.getPublicTypes(_provider, this.zoneType)
      const curPolicyType = val.policy_type || policy_types[0].value
      const policy_values = this.getPublicValues(_provider, curPolicyType)

      this.trafficPolicies.push({
        key: uid,
        provider: _provider,
        providers: _providers,
        policy_types: policy_types,
        policy_type: curPolicyType,
        policy_values: policy_values,
        isHiddenDelete: val.isHiddenDelete,
      })

      this.form.fc.getFieldDecorator(`provider[${uid}]`, this.decorators.provider(uid)[1])
      this.form.fc.getFieldDecorator(`policy_type[${uid}]`, this.decorators.policy_type(uid)[1])
      this.form.fc.getFieldDecorator(`policy_value[${uid}]`, this.decorators.policy_value(uid)[1])
      this.form.fc.getFieldDecorator(`policy_txtvalue[${uid}]`, this.decorators.policy_txtvalue(uid)[1])

      this.$nextTick(() => {
        this.form.fc.setFieldsValue({
          [`provider[${uid}]`]: _provider,
          [`policy_type[${uid}]`]: curPolicyType,
          [`policy_value[${uid}]`]: val.policy_value || '',
          [`policy_txtvalue[${uid}]`]: val.policy_value || '',
        })
      })
    },
    remove (k, idx) {
      this.trafficPolicies.splice(idx, 1)
    },
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
    policyTypeChangeHandle (val, item) {
      item.policy_type = val
      item.policy_values = this.getPublicValues(item.provider, val)

      this.$nextTick(() => {
        if (item.policy_values.length > 0) {
          this.form.fc.setFieldsValue({
            [`policy_value[${item.key}]`]: item.policy_values[0].value,
          })
          this.form.fc.setFieldsValue({
            [`policy_txtvalue[${item.key}]`]: item.policy_values[0].value,
          })
        } else {
          this.form.fc.setFieldsValue({
            [`policy_value[${item.key}]`]: '',
          })
          this.form.fc.setFieldsValue({
            [`policy_txtvalue[${item.key}]`]: '',
          })
        }
      })
    },
    generateData (values) {
      const { name, dns_type, dns_value, ttl, provider, policy_type, policy_value, policy_txtvalue, mx_priority } = values
      const { id } = this.params.detailData
      const trafficPolicies = this.trafficPolicies.map((item) => {
        return {
          provider: provider[item.key],
          policy_type: policy_type[item.key],
          policy_value: item.policy_type === 'Weighted' ? policy_txtvalue[item.key] : policy_value[item.key] || '',
        }
      })
      const data = {
        name,
        dns_type,
        dns_value,
        ttl,
        traffic_policies: trafficPolicies,
        dns_zone_id: id,
        enabled: true,
      }
      if (this.isMX) {
        data.mx_priority = mx_priority
      }
      return data
    },
    backfillData () {
      if (this.isUpdate || this.params.type === 'clone') {
        this._updateFormValue(this.params.data[0])
      }
    },
    _updateFormValue (val) {
      const { name, dns_type, dns_value, ttl, traffic_policies = [], mx_priority } = val

      traffic_policies.forEach((item) => {
        this.add({
          ...item,
          isHiddenDelete: this.isUpdate,
        })
      })
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
        }
        if (dns_type === 'MX') {
          data.mx_priority = mx_priority
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
