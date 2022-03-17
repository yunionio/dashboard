<template>
  <div>
    <page-header :title="$t('storage.filesystem.create')" />
    <page-body>
      <a-form
        class="mt-3"
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item :label="$t('network.text_205', [$t('dictionary.domain')])" v-if="$store.getters.isAdminMode">
          <domain-select v-decorator="decorators.project_domain" @change="handleDomainChange" />
        </a-form-item>
        <a-form-item :label="$t('storage.text_40')">
          <a-input v-decorator="decorators.name" :placeholder="$t('network.text_44')" />
        </a-form-item>
        <a-form-item :label="$t('common.description')">
          <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
        </a-form-item>
        <!-- 计费方式 -->
        <clearing-radios v-bind="formItemLayout" :auto_renew="false" />
        <a-form-item :label="$t('network.expired_release')" v-if="form.fd.billing_type !== 'prepaid'">
          <duration :decorators="decorators.duration" :form="form" />
        </a-form-item>
        <area-selects
          class="mb-0"
          ref="areaSelects"
          :wrapperCol="formItemLayout.wrapperCol"
          :labelCol="formItemLayout.labelCol"
          :names="areaselectsName"
          :providerParams="providerParams"
          :cloudregionParams="regionParams"
          :isRequired="true"
          filterBrandResource="compute_engine"
          @change="handleRegionChange" />
        <!-- 套餐 -->
        <file-system-sku
        @update:options="skuChanged"
        ref="REF_SKU" />
        <a-form-item :label="$t('storage.capacity')" v-bind="formItemLayout" v-if="skuOptions.step > 0">
          <a-col :span="12">
            <a-slider v-model="capacity" v-bind="skuOptions" />
          </a-col>
          <a-col :span="5">
            <a-input-number v-model="capacity" v-bind="skuOptions" /> GB
          </a-col>
        </a-form-item>
        <a-form-item :label="$t('dictionary.zone')">
          <a-radio-group v-decorator="decorators.zone_id" @change="zoneChanged">
            <a-radio-button :key="item.id" :value="item.id" v-for="item of zones">{{item.name}}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <template>
          <network-selects
            ref="REF_NETWORK"
            :label="$t('network.text_16')"
            :isDefaultFetch="false"
            :vpcFormat="vpcFormat"
            :vpcParams="vpcParams"
            :networkParams="netParams"
            v-bind="formItemLayout" />
        </template>
        <a-form-item :label="$t('compute.text_1154')" class="mb-0">
          <tag
            v-decorator="decorators.tag" />
        </a-form-item>
      </a-form>
      <bottom-bar :values="form.fc.getFieldsValue()" :cloudAccountId="cloudAccountId" />
    </page-body>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import DomainSelect from '@/sections/DomainSelect'
import Duration from '@Compute/sections/Duration'
import NetworkSelects from '@/sections/NetworkSelects'
import validateForm from '@/utils/validate'
import Tag from '@/sections/Tag'
import AreaSelects from '@/sections/AreaSelects'
import { getInitialValue } from '@/utils/common/ant'
import i18n from '@/locales'
import BottomBar from './components/BottomBar'
import FileSystemSku from './components/SKU'

function validateTag (rule, value, callback) {
  if (R.is(Object, value) && Object.keys(value).length > 20) {
    return callback(new Error(i18n.t('compute.text_209')))
  }
  callback()
}

export default {
  name: 'FileSystemCreate',
  components: {
    DomainSelect,
    Duration,
    AreaSelects,
    FileSystemSku,
    NetworkSelects,
    BottomBar,
    Tag,
  },
  data () {
    const decorators = {
      project_domain: [
        'project_domain',
        {
          initialValue: this.$store.getters.userInfo.projectDomainId,
        },
      ],
      name: [
        'name',
        {
          validateFirst: true,
          rules: [
            { required: true, message: this.$t('network.text_218') },
            { validator: validateForm('serverName') },
          ],
        },
      ],
      description: ['description'],
      zone_id: [
        'zone_id',
        {
          validateFirst: true,
          rules: [
            { required: true },
          ],
        },
      ],
      duration: {
        durationStandard: [
          'durationStandard',
          {
            initialValue: 'none',
          },
        ],
        duration: [
          'duration',
          {
            initialValue: '1h',
          },
        ],
      },
      billing_type: [
        'billing_type',
        {
          initialValue: 'postpaid',
        },
      ],
      tag: [
        'tag',
        {
          rules: [
            { validator: validateTag },
          ],
        },
      ],
    }
    return {
      loading: false,
      decorators,
      skuOptions: {},
      capacity: 0,
      zones: [],
      formItemLayout: {
        wrapperCol: {
          md: { span: 17 },
          xl: { span: 19 },
          xxl: { span: 21 },
        },
        labelCol: {
          md: { span: 7 },
          xl: { span: 5 },
          xxl: { span: 3 },
        },
      },
      tailFormItemLayout: {
        wrapperCol: {
          lg: { span: 18, offset: 6 },
          xl: { span: 20, offset: 4 },
          xxl: { span: 21, offset: 3 },
        },
      },
      vpcList: [],
    }
  },
  computed: {
    form () {
      const fc = this.$form.createForm(this, {
        onValuesChange: this.handleValuesChange,
      })
      const fd = getInitialValue(this.decorators)
      const { getFieldValue, getFieldsValue, setFieldsValue } = fc
      return {
        fc,
        fd,
        getFieldValue,
        getFieldsValue,
        setFieldsValue,
      }
    },
    ...mapGetters(['isAdminMode', 'scope', 'userInfo']),
    areaselectsName () {
      return ['provider', 'cloudregion']
    },
    cloudAccountId () {
      const values = this.form.getFieldsValue()
      const currentVpc = this.vpcList.filter(item => item.id === values.vpc)
      if (currentVpc[0]) {
        return currentVpc[0].account_id
      }
      return ''
    },
  },
  provide () {
    return {
      form: this.form,
      scopeParams: this.scopeParams,
      formItemLayout: this.formItemLayout,
      tailFormItemLayout: this.tailFormItemLayout,
    }
  },
  watch: {
    capacity: {
      handler (val) {
        this.form.fc.setFieldsValue({
          capacity: val,
        })
      },
    },
  },
  created () {
    this.form.fc.getFieldDecorator('cloudregion_id', { preserve: true })
    this.form.fc.getFieldDecorator('capacity', { preserve: true })
  },
  methods: {
    skuChanged (options) {
      this.skuOptions = options
      this.form.fc.setFieldsValue({
        capacity: this.skuOptions.min,
      })
      this.capacity = this.skuOptions.min
      this.fetchZones()
      this.fetchVpc()
    },
    zoneChanged (e) {
      this.form.fc.setFieldsValue({
        zone_id: e.target.value,
      })
      this.fetchNetwork()
    },
    billing_type_change () {
      this.$refs.REF_SKU.fetchSkus()
    },
    vpcFormat (vpc) {
      const { name, manager } = vpc
      return (
        <div class='d-flex'>
          <span class='text-truncate flex-fill mr-2' title={ name }>{ name }</span>
          <span style="color: #8492a6; font-size: 13px">{ this.$t('network.manager', [manager]) }</span>
        </div>
      )
    },
    async fetchZones () {
      const manager = new this.$Manager('zones', 'v2')
      const params = {
        cloudregion_id: this.form.fc.getFieldValue('cloudregion'),
        scope: this.scope,
      }
      if (this.skuOptions.zone_ids && this.skuOptions.zone_ids.length > 0) {
        params.filter = `id.in(${this.skuOptions.zone_ids.join(',')})`
      }
      const { data = [] } = await manager.list({ params })
      this.zones = data.data || []
      if (this.zones.length > 0) {
        this.$nextTick(() => {
          this.form.fc.setFieldsValue({
            zone_id: this.zones[0].id,
          })
        })
      }
    },
    fetchVpc () {
      this.$refs.REF_NETWORK.fetchVpc(this.vpcListChange)
    },
    vpcListChange ({ vpcList }) {
      this.vpcList = vpcList
    },
    fetchNetwork () {
      this.$refs.REF_NETWORK.fetchNetwork()
    },
    handleDomainChange (val) {
      this.$refs.areaSelects.fetchs(this.areaselectsName)
    },
    handleRegionChange (val) {
      if (val.cloudregion) {
        this.form.fc.setFieldsValue({
          cloudregion_id: val.cloudregion.id,
        })
        this.$refs.REF_SKU.fetchSkus()
        this.fetchVpc()
      }
    },
    providerParams () {
      const params = {
        limit: 0,
        enabled: 1,
        cloud_env: 'public',
        scope: this.scope,
        provider: this.$store.getters.capability.nas_brands,
      }
      if (!this.$store.getters.capability.nas_brands || this.$store.getters.capability.nas_brands.length === 0) {
        params.provider = 'Other'
      }
      if (this.isAdminMode) {
        params.admin = true
        params.project_domain = this.form.fc.getFieldValue('project_domain')
        delete params.scope
      }
      return params
    },
    regionParams () {
      const params = {
        usable: true,
        show_emulated: true,
      }
      if (this.isAdminMode) {
        params.admin = true
        params.project_domain = this.form.fc.getFieldValue('project_domain')
        delete params.scope
      }
      return params
    },
    vpcParams () {
      const params = {
        cloudregion_id: this.form.fc.getFieldValue('cloudregion'),
        scope: this.scope,
      }
      if (this.isAdminMode) {
        params.project_domain = this.form.fc.getFieldValue('project_domain')
      }
      return params
    },
    netParams () {
      const params = {
        zone_id: this.form.fd.zone_id,
        scope: this.scope,
      }
      return params
    },
    async handleValuesChange (fc, changedFields) {
      this.form.fd = {
        ...this.form.fd,
        ...changedFields,
      }
      await this.$nextTick()
      const changedFieldsKey = Object.keys(changedFields)
      changedFieldsKey.forEach(field => {
        // if (changedFields[field] === undefined) return false

        const handleChange = this[`${field}_change`]
        if (this[`${field}_change`]) {
          return handleChange()
        }
      })
    },
  },
}
</script>
