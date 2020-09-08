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
            v-decorator="decorators.dns_type">
            <a-select-option v-for="v in options.dnsTypes" :value="v.value" :key="v.value">
              {{ v.label }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('network.text_152')">
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
                  <a-select-option
                    :key="i"
                    :value="item.value"
                    v-for="(item, i) in item.policy_types">
                    {{item.label}}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="6">
              <a-form-item>
                <a-select v-decorator="decorators.policy_value(item.key)">
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
              <a-button shape="circle" icon="minus" size="small" @click="() => remove(item.key, idx)" class="mt-2" />
            </a-col>
          </a-row>
          <div class="d-flex align-items-center mt-1" v-if="options.providers.length > trafficPolicies.length">
            <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
            <a-button type="link" @click="add">{{$t('common_697')}}</a-button>
          </div>
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { providers, policy_types, policy_values } from '../constants'
import { getDnsTypes, getDnsProviders, getTtls } from '../utils'
import { uuid } from '@/utils/utils'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'DnsRecordSetCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const dnsTypes = getDnsTypes(this.params.detailData)
    const dnsProviders = getDnsProviders(providers, this.params.detailData)
    const ttls = getTtls(this.params.detailData)
    return {
      loading: false,
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
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            rules: [
              { required: true, message: this.$t('common_695') },
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
            rules: [
              { required: true, message: this.$t('network.text_175') },
            ],
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
              message: this.$t('db.text_30'),
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
              message: this.$t('network.text_334'),
            }],
          },
        ]),
        policy_value: (k) => ([
          `policy_value[${k}]`,
          {
            initialValue: '',
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
    isPublicZone () {
      return this.params.detailData.zone_type === 'PublicZone'
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
  },
  created () {
    this.recordsetManager = new this.$Manager('dns_recordsets')
  },
  mounted () {
    this.backfillData()
  },
  methods: {
    add (val) {
      const uid = uuid()
      const provider = this.form.fc.getFieldValue('provider') || {}
      const providerValues = Object.values(provider)
      const _providers = this.options.providers.filter(item => !providerValues.includes(item.value))
      const pv = (_providers[0].value).toLowerCase()
      const curPolicyType = val.policy_type || policy_types[pv][0].value
      this.trafficPolicies.push({
        key: uid,
        providers: _providers,
        policy_types: policy_types[pv],
        policy_values: policy_values[curPolicyType],
      })

      this.$nextTick(() => {
        this.form.fc.setFieldsValue({
          [`provider[${uid}]`]: val.provider || _providers[0].value,
          [`policy_type[${uid}]`]: curPolicyType,
          [`policy_value[${uid}]`]: val.policy_value || '',
        })
      })
    },
    remove (k, idx) {
      this.trafficPolicies.splice(idx, 1)
    },
    doCreate (data) {
      if (this.params.type === 'create') {
        return this.recordsetManager.create({ data })
      } else if (this.params.type === 'update') {
        return this.recordsetManager.update({ id: this.params.data[0].id, data })
      } else if (this.params.type === 'clone') {
        return this.recordsetManager.create({ data })
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const newValues = this.generateData(values)
        await this.doCreate(newValues)
        this.loading = false
        this.params.refresh && this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    policyTypeChangeHandle (val, item) {
      item.policy_values = policy_values[val] || []

      this.$nextTick(() => {
        if (item.policy_values.length > 0) {
          this.form.fc.setFieldsValue({
            [`policy_value[${item.key}]`]: item.policy_values[0].value,
          })
        } else {
          this.form.fc.setFieldsValue({
            [`policy_value[${item.key}]`]: '',
          })
        }
      })
    },
    generateData (values) {
      const { name, dns_type, dns_value, ttl, provider, policy_type, policy_value } = values
      const { id } = this.params.detailData
      const trafficPolicies = this.trafficPolicies.map((item) => {
        return {
          provider: provider[item.key],
          policy_type: policy_type[item.key],
          policy_value: policy_value[item.key] || '',
        }
      })
      return {
        name,
        dns_type,
        dns_value,
        ttl,
        traffic_policies: trafficPolicies,
        dns_zone_id: id,
        enabled: true,
      }
    },
    backfillData () {
      if (this.params.type === 'update' || this.params.type === 'clone') {
        this._updateFormValue(this.params.data[0])
      }
    },
    _updateFormValue (val) {
      const { name, dns_type, dns_value, ttl, traffic_policies = [] } = val

      traffic_policies.forEach((item) => {
        this.add(item)
      })
      this.$nextTick(() => {
        let _name = ''
        if (this.params.type === 'update') {
          _name = name
        }
        this.form.fc.setFieldsValue({
          name: _name,
          dns_type,
          dns_value,
          ttl,
        })
      })
    },
    ttlClickHandle (v) {
      this.form.fc.setFieldsValue({
        ttl: v.value,
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
