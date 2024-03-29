<template>
  <div>
    <page-header :title="$t('common_628', [$t('dictionary.cdn_domain')])" />
    <page-body needMarginBottom>
      <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout" hideRequiredMark>
        <a-form-item :label="$t('network.text_205', [$t('dictionary.project')])" class="mb-0">
          <domain-project
            :fc="form.fc"
            :form-layout="formItemLayout"
            :decorators="{ project: decorators.project, domain: decorators.domain }" />
        </a-form-item>
        <a-form-item :label="$t('network.cdn.cloudprovider')">
          <base-select
            resource="cloudproviders"
            v-decorator="decorators.cloudprovider"
            :params="params.cloudprovider"
            :isDefaultSelect="true"
            :showSync="true"
            :select-props="{ placeholder: $t('compute.text_149') }" />
        </a-form-item>
        <a-form-item :label="$t('network.cdn.accelerated_domain')">
          <a-input v-decorator="decorators.accelerated_domain" />
        </a-form-item>
        <a-form-item :label="$t('network.cdn.area')">
          <a-radio-group v-decorator="decorators.area">
            <a-radio-button v-for="item in areaOpts" :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('network.cdn.service_type')">
          <a-select v-decorator="decorators.service_type">
            <a-select-option v-for="item in serviceTypeOpts" :key="item.key">{{ item.label }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('network.cdn.origin_types')">
          <a-radio-group v-decorator="decorators.origin_type">
            <a-radio-button v-for="item in originTypeOpts" :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('network.cdn.source_protocol')">
          <a-radio-group v-decorator="decorators.origin_protocol">
            <a-radio-button v-for="item in originProtocols" :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          v-for="(k, index) in form.fc.getFieldValue('keys')"
          :key="k"
          v-bind="index === 0 ? formItemLayout : formItemLayoutWithOutLabel"
          :label="index === 0 ? $t('network.cdn.source_origin') : ''"
          :required="false">
          <a-row :gutter="6">
            <a-col :span="8">
              <a-form-item
                :wrapperCol="{ span: 24 }"
                class="mb-0 mr-1">
                <a-input v-decorator="decorators.originAddress.origin(k)" :placeholder="$t('network.cdn.origin')" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                :wrapperCol="{ span: 24 }"
                class="mb-0 mr-1">
                <a-input v-decorator="decorators.originAddress.port(k)"  :placeholder="$t('network.text_165')" />
              </a-form-item>
            </a-col>
            <a-col :span="7">
              <a-form-item
                :wrapperCol="{ span: 24 }"
                class="mb-0 mr-1">
                <a-input v-decorator="decorators.originAddress.priority(k)" :placeholder="$t('network.text_166')" />
              </a-form-item>
            </a-col>
            <a-col :span="1">
              <a-button v-if="index === 0" type="primary" shape="circle" icon="plus" size="small" @click="add" />
              <a-button v-else shape="circle" icon="minus" size="small" @click="remove(k)" />
            </a-col>
          </a-row>
        </a-form-item>
      </a-form>
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button class="mr-3" type="primary" @click="handleConfirm" :loading="loading">
          {{$t('compute.text_907')}}
        </a-button>
        <a-button @click="handleCancel">{{$t('compute.text_908')}}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import { validate, isRequired } from '@/utils/validate'
import { Manager } from '@/utils/manager'
import DomainProject from '@/sections/DomainProject'
import { AREAS, SERVICE_TYPES, ORIGIN_TYPES, ORIGIN_PROTOCOLS } from '../constants'

let id = 0
export default {
  name: 'CdnCreate',
  components: {
    DomainProject,
  },
  data () {
    return {
      areaOpts: AREAS,
      serviceTypeOpts: SERVICE_TYPES,
      originTypeOpts: ORIGIN_TYPES,
      originProtocols: ORIGIN_PROTOCOLS,
      loading: false,
      decorators: {
        domain: [
          'domain',
          {
            rules: [
              { validator: isRequired(), message: this.$t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            rules: [
              { validator: isRequired(), message: this.$t('dictionary.project'), trigger: 'change' },
            ],
          },
        ],
        cloudprovider: [
          'cloudprovider',
          {
            rules: [
              { required: true, message: this.$t('network.text_689') },
            ],
          },
        ],
        accelerated_domain: [
          'accelerated_domain',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('network.cdn.accelerated_domain')]) },
              { validator: this.checkDomainHandle },
            ],
          },
        ],
        area: [
          'area',
          {
            rules: [
              { required: true, message: this.$t('network.cdn.area_require_message') },
            ],
            initialValue: 'mainland',
          },
        ],
        service_type: [
          'service_type',
          {
            initialValue: 'web',
          },
        ],
        origin_type: [
          'origin_type',
          {
            initialValue: 'domain',
          },
        ],
        origin_protocol: [
          'origin_protocol',
          {
            initialValue: 'http',
          },
        ],
        originAddress: {
          origin: i => [
            `origin[${i}]`,
            {
              validateFirst: true,
              validateTrigger: ['change', 'blur'],
              rules: [
                { required: true, message: this.$t('network.cdn.origin_require_message') },
                { validator: this.validateIpOrDomain },
                { validator: this.validateOriginRepeat },
              ],
            },
          ],
          port: i => [
            `port[${i}]`,
            {
              // validateTrigger: ['change', 'blur'],
              // rules: [
              //   { required: true, message: this.$t('network.cdn.port_require_message') },
              // ],
            },
          ],
          priority: i => [
            `priority[${i}]`,
            {
              validateTrigger: ['change', 'blur'],
              rules: [
                // { required: true, message: this.$t('network.cdn.priority_require_message') },
                { validator: this.validatePriority },
              ],
            },
          ],
        },
      },
      params: {
        domain: {
          scope: this.$store.getters.scope,
          limit: 0,
        },
        cloudprovider: {
          scope: this.$store.getters.scope,
          brand: 'Qcloud',
        },
      },
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
      formItemLayoutWithOutLabel: {
        wrapperCol: {
          md: { span: 18, offset: 6 },
          xl: { span: 20, offset: 4 },
          xxl: { span: 22, offset: 2 },
        },
      },
    }
  },
  beforeCreate () {
    this.form = {}
    this.form.fc = this.$form.createForm(this, { name: 'cdn_create_form' })
    this.form.fc.getFieldDecorator('keys', { initialValue: [id], preserve: true })
  },
  methods: {
    handleCancel () {
      this.goBack()
    },
    generateValues (values) {
      const data = {
        domain: values.domain.key,
        tenant: values.project.key,
        cloudprovider_id: values.cloudprovider,
        name: values.accelerated_domain,
        area: values.area,
        service_type: values.service_type,
      }
      const origins = []
      values.keys.forEach(key => {
        origins.push({
          origin: values.origin[key],
          port: values.port[key],
          priority: values.priority[key],
          protocol: values.origin_protocol,
          type: this.getType(values.origin[key]),
        })
      })
      data.origins = origins
      return data
    },
    async handleConfirm () {
      const { validateFields } = this.form.fc
      const manager = new Manager('cdn_domains')
      try {
        const values = await validateFields()
        this.loading = true
        await manager.create({
          data: Object.assign({}, this.generateValues(values)),
        })
        this.goBack()
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
    checkDomainHandle (rule, value, callback) {
      if (validate(value, 'domain') === false || validate(value, 'domain').result === false) {
        callback(new Error(this.$t('network.text_178')))
      }
      callback()
    },
    add () {
      const { form } = this
      const keys = form.fc.getFieldValue('keys')
      const nextKeys = keys.concat(++id)
      form.fc.setFieldsValue({
        keys: nextKeys,
      })
      form.fc.validateFields(['origin', 'priority'], { force: true })
    },
    remove (k) {
      const { form } = this
      const keys = form.fc.getFieldValue('keys')
      const orgins = form.fc.getFieldValue('origin')

      if (keys.length === 1) {
        return
      }
      form.fc.setFieldsValue({
        keys: keys.filter(key => key !== k),
        origin: orgins.filter(origin => origin !== orgins[k]),
      })
      form.fc.validateFields(['origin', 'priority'], { force: true })
    },
    goBack () {
      this.$router.push({
        name: 'CdnList',
      })
    },
    validateOriginRepeat (rule, value, callback) {
      const { form } = this
      this.$nextTick(() => {
        const orgins = form.fc.getFieldValue('origin')
        const isRepeat = orgins.filter(item => item === value).length > 1

        if (value && orgins.length > 1 && isRepeat) {
          // eslint-disable-next-line standard/no-callback-literal
          callback(this.$t('network.cdn.origin_repeat_validate'))
        } else {
          callback()
        }
      })
    },
    validatePriority (rule, value, callback) {
      const { form } = this
      this.$nextTick(() => {
        const prioritys = form.fc.getFieldValue('priority')
        if (value && prioritys.length === 1) {
          // eslint-disable-next-line standard/no-callback-literal
          callback(this.$t('network.cdn.priority_validate'))
        } else {
          callback()
        }
      })
    },
    validateIpOrDomain (rule, value, callback) {
      if (/^[a-zA-Z]/.test(value)) {
        return this.$validate('domain')(rule, value, callback)
      } else if (/^[0-9]/.test(value)) {
        return this.$validate('IPv4')(rule, value, callback)
      }
      callback()
    },
    getType (value) {
      if (/^[0-9]/.test(value) && validate(value, 'IPv4')) {
        return 'ip'
      } else if (/^[a-zA-Z]/.test(value) && validate(value, 'domain')) {
        return 'domain'
      }
      return ''
    },
  },
}
</script>

<style>

</style>
