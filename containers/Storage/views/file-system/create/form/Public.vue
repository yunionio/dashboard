<template>
  <div>
    <a-form
      class="mt-3"
      v-bind="formItemLayout"
      :form="form.fc"
      hideRequiredMark>
      <a-form-item :label="$t('storage.text_55', [$t('dictionary.project')])" v-bind="formItemLayout">
        <domain-project :fc="form.fc" :decorators="{ project: decorators.project, domain: decorators.domain }" @update:domain="handleDomainChange" />
      </a-form-item>
      <a-form-item :label="$t('storage.text_40')">
        <a-input v-decorator="decorators.name" />
        <template v-slot:extra>
          <name-repeated res="file_systems" :name="form.fd.name" :default-text="$t('compute.text_893')" />
        </template>
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
        :zoneParams="zoneParams"
        :defaultActiveFirstOption="['provider', 'cloudregion']"
        filterBrandResource="compute_engine"
        @change="handleRegionChange" />
      <a-form-item :label="$t('compute.text_15')" required v-bind="formItemLayout">
        <base-select
          class="w-50"
          v-decorator="decorators.cloudprovider"
          resource="cloudproviders"
          :params="cloudproviderParams"
          :mapper="providerMapper"
          :isDefaultSelect="true"
          :showSync="true"
          :select-props="{ placeholder: $t('common.tips.select', [$t('compute.text_653')]) }" />
      </a-form-item>
      <!-- 套餐 -->
      <file-system-sku
        @update:options="skuChanged"
        ref="REF_SKU" />
      <a-form-item :label="$t('storage.capacity')" v-bind="formItemLayout" v-if="isShowCapacity">
        <a-col :span="12">
          <a-tooltip>
            <template slot="title" v-if="capacityTooltip">
              {{ capacityTooltip }}
            </template>
            <a-input-number v-model="capacity" v-bind="skuOptions" /> GB
          </a-tooltip>
        </a-col>
      </a-form-item>
      <network-selects
        ref="REF_NETWORK"
        :label="$t('network.text_16')"
        :isDefaultFetch="false"
        :vpcFormat="vpcFormat"
        :vpcParams="vpcParams"
        :networkParams="netParams"
        v-bind="formItemLayout"
        class="mb-0" />
      <a-form-item :label="$t('compute.text_1154')" class="mb-0">
        <tag
          v-decorator="decorators.tag" :allowNoValue="false" />
      </a-form-item>
    </a-form>
    <bottom-bar
      :values="form.fc.getFieldsValue()"
      :cloudAccountId="cloudAccountId"
      @submit="handleConfirm"
      @cancel="handleCancel" />
  </div>
</template>

<script>
import * as R from 'ramda'
import DomainProject from '@/sections/DomainProject'
import Duration from '@Compute/sections/Duration'
import NetworkSelects from '@/sections/NetworkSelects'
import validateForm, { isRequired } from '@/utils/validate'
import Tag from '@/sections/Tag'
import AreaSelects from '@/sections/AreaSelects'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'
import i18n from '@/locales'
import BottomBar from '../components/BottomBar'
import FileSystemSku from '../components/SKU'
import fsCreateMixin from './mixin'

function validateTag (rule, value, callback) {
  if (R.is(Object, value) && Object.keys(value).length > 20) {
    return callback(new Error(i18n.t('compute.text_209')))
  }
  callback()
}

export default {
  name: 'FileSystemPublicCreate',
  components: {
    DomainProject,
    Duration,
    AreaSelects,
    FileSystemSku,
    NetworkSelects,
    BottomBar,
    Tag,
  },
  mixins: [fsCreateMixin],
  data () {
    const cloudEnvOptions = getCloudEnvOptions('object_storage_brands', true)
    const decorators = {
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
            { validator: isRequired(), message: this.$t('rules.project'), trigger: 'change' },
          ],
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
      cloudprovider: [
        'cloudprovider',
        {
          rules: [
            { required: true, message: this.$t('common.tips.select', [this.$t('compute.text_653')]) },
          ],
        },
      ],
      zone_id: [
        'zone_id',
        {
          rules: [
            { required: false },
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
      tailFormItemLayout: {
        wrapperCol: {
          lg: { span: 18, offset: 6 },
          xl: { span: 20, offset: 4 },
          xxl: { span: 21, offset: 3 },
        },
      },
      vpcList: [],
      cloudEnvOptions,
      routerQuery: this.$route.query.type,
      cloudEnv: this.$route.query.type ? this.$route.query.type : cloudEnvOptions[0].key,
    }
  },
  computed: {
    areaselectsName () {
      return ['provider', 'cloudregion', 'zone']
    },
    cloudAccountId () {
      const values = this.form.fc.getFieldsValue()
      const currentVpc = this.vpcList.filter(item => item.id === values.vpc)
      if (currentVpc[0]) {
        return currentVpc[0].account_id
      }
      return ''
    },
    cloudproviderParams () {
      const params = {
        limit: 0,
        enabled: 1,
        details: true,
        scope: this.scope,
        read_only: false,
        cloudregion: this.form.fd.cloudregion_id,
      }
      if (this.isAdminMode) {
        params.admin = true
        params.project_domain = this.form.fd.domain?.key
        delete params.scope
        delete params.domain_id
      }
      return params
    },
    providerParams () {
      const params = {
        limit: 0,
        enabled: 1,
        cloud_env: 'public',
        scope: this.scope,
        provider: this.capability.nas_brands,
      }
      if (!this.capability.nas_brands || this.capability.nas_brands.length === 0) {
        params.provider = 'Other'
      }
      if (this.isAdminMode) {
        params.admin = true
        params.project_domain = this.form.fd.domain?.key
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
        params.project_domain = this.form.fd.domain?.key
        delete params.scope
      }
      return params
    },
    zoneParams () {
      return {
        usable: true,
        show_emulated: true,
        order_by: 'created_at',
        order: 'asc',
        project_domain: this.form.fd.domain?.key,
      }
    },
    vpcParams () {
      const params = {
        cloudregion_id: this.form.fd.cloudregion_id,
        scope: this.scope,
        manager_id: this.form.fd.cloudprovider,
      }
      if (this.isAdminMode) {
        params.project_domain = this.form.fd.domain?.key
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
    isShowCapacity () {
      return this.form.fd.sku?.min_disk_size_gb !== -1
    },
    capacityConf () {
      const capacityConf = {}
      const { min_disk_size_gb, max_disk_size_gb } = this.form.fd.sku || {}
      if (this.isShowCapacity) {
        capacityConf.min = min_disk_size_gb
        capacityConf.max = max_disk_size_gb
      }
      return capacityConf
    },
    capacityTooltip () {
      const { min, max } = this.capacityConf
      if (min) {
        return this.$t('compute.text_137', [min, max])
      }
      return null
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
    'form.fd.zone': {
      handler (val) {
        if (val) {
          this.$refs.REF_SKU.fetchSkus(['cloudregion_id', 'zone_id'])
        } else {
          this.$refs.REF_SKU.fetchSkus(['cloudregion_id'])
        }
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
      // this.fetchZones()
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
          <span class='text-truncate flex-fill mr-2' title={name}>{name}</span>
          <span style="color: #8492a6; font-size: 13px">{this.$t('network.manager', [manager])}</span>
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
      if (val.zone) {
        this.form.fc.setFieldsValue({
          zone_id: val.zone.id,
        })
      }
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
    doCreate (data) {
      return new this.$Manager('file_systems').create({ data })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const params = {
          billing_type: values.billing_type,
          generate_name: values.name,
          description: values.description,
          network_id: values.network,
          zone_id: values.zone_id,
          project_domain: (values.domain && values.domain.key) || this.userInfo.projectDomainId,
          project_id: (values.project && values.project.key) || this.userInfo.projectId,
        }
        if (values.tag) {
          params.__meta__ = values.tag
        }
        if (values.sku) {
          params.file_system_type = values.sku.file_system_type
          params.protocol = values.sku.protocol
          params.storage_type = values.sku.storage_type
        }
        if (values.capacity > 0) {
          params.capacity = values.capacity
        }
        if (values.billing_type === 'postpaid') {
          if (values.durationStandard !== 'none') {
            params.duration = values.durationStandard
            if (values.durationStandard === 'custom') {
              params.duration = values.duration
            }
          }
          if (values.auto_renew) {
            params.auto_renew = values.auto_renew
          }
        } else {
          params.duration = values.duration
        }

        await this.doCreate(params)
        this.$message.success(this.$t('network.nat.create.success'))
        this.$router.push('/nas')
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
