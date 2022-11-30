<template>
  <div>
    <page-header :title="$t('common_628', [$t('dictionary.cdn_domain')])" />
    <page-body needMarginBottom>
      <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout" hideRequiredMark>
        <a-form-item :label="$t('network.cdn.domain')">
          <base-select
            v-decorator="decorators.project_domain_id"
            resource="domains"
            version="v1"
            :params="params.domain"
            @change="domainChange"
            filterable />
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
        <a-form-item :label="$t('network.cdn.domain')">
          <a-input v-decorator="decorators.domain" />
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
import { validate } from '@/utils/validate'
import { Manager } from '@/utils/manager'
import { AREAS, SERVICE_TYPES, ORIGIN_TYPES, ORIGIN_PROTOCOLS } from '../constants'

let id = 0
export default {
  name: 'CdnCreate',
  data () {
    const projectDomainId = this.$store.getters.userInfo.projectDomainId
    return {
      areaOpts: AREAS,
      serviceTypeOpts: SERVICE_TYPES,
      originTypeOpts: ORIGIN_TYPES,
      originProtocols: ORIGIN_PROTOCOLS,
      loading: false,
      decorators: {
        project_domain_id: [
          'project_domain_id',
          {
            rules: [
              { required: true, message: this.$t('k8s.text_413') },
            ],
            initialValue: projectDomainId,
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
        domain: [
          'domain',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_522') },
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
              validateTrigger: ['change', 'blur'],
              rules: [
                { required: true, message: this.$t('network.cdn.origin_require_message') },
              ],
            },
          ],
          port: i => [
            `port[${i}]`,
            {
              validateTrigger: ['change', 'blur'],
              rules: [
                { required: true, message: this.$t('network.cdn.port_require_message') },
              ],
            },
          ],
          priority: i => [
            `priority[${i}]`,
            {
              validateTrigger: ['change', 'blur'],
              rules: [
                { required: true, message: this.$t('network.cdn.priority_require_message') },
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
        cloudprovider: {},
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
    const projectDomainId = this.$store.getters.userInfo.projectDomainId
    this.form = {}
    this.form.fd = { project_domain_id: projectDomainId }
    this.form.fc = this.$form.createForm(this, { name: 'cdn_create_form' })
    this.form.fc.getFieldDecorator('keys', { initialValue: [id], preserve: true })
  },
  methods: {
    handleCancel () {
      this.goBack()
    },
    generateValues (values) {
      const data = {
        project_domain_id: values.project_domain_id,
        cloudprovider_id: values.cloudprovider,
        generate_name: values.domain,
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
          type: values.origin_type,
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
    domainChange (val) {
      this.form.fd.project_domain_id = val
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
      const nextKeys = keys.concat(id++)
      form.fc.setFieldsValue({
        keys: nextKeys,
      })
    },
    remove (k) {
      const { form } = this
      const keys = form.fc.getFieldValue('keys')
      if (keys.length === 1) {
        return
      }

      form.fc.setFieldsValue({
        keys: keys.filter(key => key !== k),
      })
    },
    goBack () {
      this.$router.push({
        name: 'CdnList',
      })
    },
  },
}
</script>

<style>

</style>
