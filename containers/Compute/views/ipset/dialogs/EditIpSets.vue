<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ dialogTitle }}</div>
    <div slot="body">
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item v-if="!isEdit" :label="$t('compute.text_297', [$t('dictionary.project')])" class="mb-0">
          <domain-project
            :fc="form.fc"
            :form-layout="formItemLayout"
            :decorators="{ project: decorators.project, domain: decorators.domain }"
            @update:domain="handleDomainChange" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_228')" class="mb-0">
          <a-input :placeholder="$t('validator.resourceName')" v-decorator="decorators.name" />
        </a-form-item>
        <a-form-item :label="$t('common.description')" class="mb-0">
          <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" :placeholder="$t('common_367')" v-decorator="decorators.description" />
        </a-form-item>
        <template v-if="isManaged">
          <area-selects
            class="mb-0"
            ref="areaSelects"
            :wrapperCol="formItemLayout.wrapperCol"
            :labelCol="formItemLayout.labelCol"
            :names="areaselectsName"
            :providerParams="providerParams"
            :cloudregionParams="cloudregionParams"
            :providerMapper="providerMapper"
            :cloudregionMapper="cloudregionMapper"
            :cloudregionParamsMapper="cloudregionParamsMapper"
            :isRequired="true"
            @change="handleRegionChange" />
          <a-form-item :label="$t('compute.text_15')" class="mb-0">
            <base-select
              resource="cloudproviders"
              v-decorator="decorators.manager_id"
              :params="cloudproviderParams"
              :isDefaultSelect="true"
              :needParams="true"
              :showSync="true"
              :select-props="{ placeholder: $t('compute.text_149') }" />
          </a-form-item>
        </template>
        <a-form-item :label="$t('compute.text_175')" class="mb-0">
          <a-radio-group v-decorator="decorators.ip_set_type" @change="ipsetTypeChange" :disabled="isEdit">
            <a-radio value="ipv4_cidr_list">IPv4</a-radio>
            <a-radio value="ipv6_cidr_list">IPv6</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="decLabel" :extra="$t('compute.secgroup.secrule.source.prompt')" class="mb-0">
          <a-textarea
            :auto-size="{ minRows: 3, maxRows: 10 }"
            v-decorator="decorators.data"
            :placeholder="$t('compute.text_996')" />
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
import { isRequired, REGEXP } from '@/utils/validate'
import DomainProject from '@/sections/DomainProject'
import AreaSelects from '@/sections/AreaSelects'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

import { IPSET_PRIVATE_BRANDS, IPSET_PUBLIC_BRANDS } from '../constants'

export default {
  name: 'EditIpSetsDialog',
  components: {
    DomainProject,
    AreaSelects,
  },
  mixins: [DialogMixin, WindowsMixin],
  provide () {
    return {
      form: this.form,
    }
  },
  data () {
    const selectItem = (this.params.data && this.params.data[0]) || {}
    const ipsetType = selectItem.ip_set_type || selectItem.ipset_type || 'ipv4_cidr_list'
    const dataValue = Array.isArray(selectItem.data)
      ? selectItem.data.join(',')
      : (selectItem.data || '')
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      allowedPrivateBrands: IPSET_PRIVATE_BRANDS,
      allowedPublicBrands: IPSET_PUBLIC_BRANDS,
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
              { validator: isRequired(), message: this.$t('rules.project'), trigger: 'change' },
            ],
          },
        ],
        name: [
          'name',
          {
            initialValue: selectItem.name,
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.text_210') },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        description: [
          'description',
          {
            initialValue: selectItem.description || '',
          },
        ],
        manager_id: [
          'manager_id',
          {
            rules: [
              { required: true, message: this.$t('compute.text_149') },
            ],
          },
        ],
        ip_set_type: [
          'ip_set_type',
          {
            initialValue: ipsetType,
          },
        ],
        data: [
          'data',
          {
            initialValue: dataValue,
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.text_996') },
              { validator: this.validateCIDR },
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
      ipsetType,
      regionId: '',
      regionProvider: '',
      projectDomain: '',
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'isAdminMode', 'scope']),
    isEdit () {
      return this.params.title === 'edit'
    },
    cloudEnv () {
      return this.params.cloudEnv || 'onpremise'
    },
    isManaged () {
      return !this.isEdit && ['private', 'public'].includes(this.cloudEnv)
    },
    isPublic () {
      return this.cloudEnv === 'public'
    },
    isQcloud () {
      return String(this.regionProvider).toLowerCase() === 'qcloud'
    },
    areaselectsName () {
      if (this.cloudEnv === 'private') {
        return ['cloudregion']
      }
      return ['provider', 'cloudregion']
    },
    allowedBrands () {
      if (this.cloudEnv === 'private') {
        return this.allowedPrivateBrands
      }
      if (this.cloudEnv === 'public') {
        return this.allowedPublicBrands
      }
      return []
    },
    dialogTitle () {
      if (this.isEdit) {
        return `${this.$t('compute.text_982')}${this.$t('compute.title.ipset')}`
      }
      return `${this.$t('compute.perform_create')}${this.$t('compute.title.ipset')}`
    },
    decLabel () {
      return this.ipsetType === 'ipv6_cidr_list' ? 'IPv6 CIDR' : 'IPv4 CIDR'
    },
    providerParams () {
      const params = {
        cloud_env: 'public',
        usable: false,
        read_only: false,
      }
      if (this.isAdminMode) {
        params.project_domain = this.projectDomain || this.userInfo.projectDomainId
      } else {
        params.scope = this.scope
      }
      return params
    },
    cloudregionParams () {
      const params = {
        scope: this.scope,
        limit: 0,
        usable: false,
        show_emulated: true,
        read_only: false,
      }
      if (this.cloudEnv === 'private') {
        params.is_private = true
        params.provider = 'Cloudpods'
      } else if (this.cloudEnv === 'public') {
        params.is_public = true
      }
      if (this.isAdminMode) {
        params.project_domain = this.projectDomain || this.userInfo.projectDomainId
        delete params.scope
      }
      return params
    },
    cloudproviderParams () {
      if (this.isPublic && !this.regionProvider) return {}
      if (!this.isQcloud && !this.regionId) return {}
      const params = {
        limit: 0,
        enabled: true,
        read_only: false,
        'filter.0': 'status.equals("connected")',
      }
      if (!this.isQcloud && this.regionId) {
        params.cloudregion = this.regionId
      }
      if (this.regionProvider) {
        params.brand = this.regionProvider
      } else if (this.cloudEnv === 'private') {
        params.brand = 'Cloudpods'
      }
      if (this.isAdminMode) {
        params.project_domain = this.projectDomain || this.userInfo.projectDomainId
      } else {
        params.scope = this.scope
      }
      return params
    },
  },
  methods: {
    isAllowedBrand (brand) {
      if (!brand) return false
      return this.allowedBrands.some(item => item.toLowerCase() === String(brand).toLowerCase())
    },
    providerMapper (list = []) {
      return list.filter(item => this.isAllowedBrand(item.name || item.provider || item.brand))
    },
    cloudregionMapper (list = []) {
      return list.filter(item => this.isAllowedBrand(item.provider || item.brand))
    },
    cloudregionParamsMapper (params = {}) {
      const next = { ...params }
      if (this.cloudEnv === 'private') {
        next.provider = 'Cloudpods'
        return next
      }
      if (this.cloudEnv === 'public' && !next.provider) {
        const hasProviderFilter = [].concat(next.filter || []).some(item => String(item).includes('provider.in'))
        if (!hasProviderFilter) {
          next.filter = [].concat(next.filter || [], [`provider.in(${this.allowedPublicBrands.join(',')})`])
        }
      }
      return next
    },
    handleDomainChange (val) {
      this.projectDomain = (val && val.key) || val || ''
    },
    handleRegionChange (data) {
      const { provider, cloudregion } = data || {}
      if (data && data.hasOwnProperty('provider')) {
        const nextProvider = provider ? (provider.id || provider) : ''
        this.regionProvider = this.isAllowedBrand(nextProvider) ? nextProvider : ''
        if (!this.regionProvider) {
          this.regionId = ''
        }
      }
      if (cloudregion) {
        const brand = cloudregion.provider || cloudregion.brand || this.regionProvider
        if (!this.isAllowedBrand(brand)) {
          this.regionId = ''
          return
        }
        this.regionId = cloudregion.id || cloudregion
        if (!this.regionProvider && brand) {
          this.regionProvider = brand
        }
      } else if (data && data.hasOwnProperty('cloudregion')) {
        this.regionId = ''
      }
    },
    ipsetTypeChange (e) {
      this.ipsetType = e.target.value
      this.form.fc.validateFields(['data'])
    },
    parseDataList (value) {
      if (!value) return []
      if (Array.isArray(value)) {
        return value.map(item => String(item).trim()).filter(Boolean)
      }
      return String(value).split(/[,\n]/).map(item => item.trim()).filter(Boolean)
    },
    validateCIDR (rule, value, callback) {
      if (!value) {
        return callback()
      }
      const items = this.parseDataList(value)
      const isIpv6 = this.ipsetType === 'ipv6_cidr_list'
      for (const item of items) {
        if (isIpv6) {
          if (!REGEXP.IPv6.regexp.test(item) && !REGEXP.cidr6.regexp.test(item)) {
            return callback(new Error(this.$t('common.tips.input', ['IPv6/CIDR'])))
          }
        } else if (!REGEXP.IPv4.regexp.test(item) && !REGEXP.cidr.regexp.test(item)) {
          return callback(new Error(this.$t('common.tips.input', ['IPv4/CIDR'])))
        }
      }
      return callback()
    },
    genData (values) {
      const { project, domain, data, cloudregion, provider, manager_id, ...rest } = values
      const payload = {
        ...rest,
        data: this.parseDataList(data).join(','),
      }
      if (!this.isEdit) {
        payload.project_domain = (domain && domain.key) || this.userInfo.projectDomainId
        payload.project_id = (project && project.key) || this.userInfo.projectId
        if (this.isManaged) {
          const providerName = this.regionProvider || (provider && (provider.id || provider)) || ''
          const isQcloud = String(providerName).toLowerCase() === 'qcloud'
          if (!isQcloud) {
            payload.cloudregion_id = this.regionId || cloudregion
          }
          payload.manager_id = manager_id
        }
      }
      return payload
    },
    doCreate (data) {
      return this.params.onManager('create', {
        managerArgs: { data },
      })
    },
    doUpdate (data) {
      return this.params.onManager('update', {
        id: this.params.data[0].id,
        managerArgs: { data },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const payload = this.genData(values)
        if (this.isEdit) {
          await this.doUpdate(payload)
        } else {
          await this.doCreate(payload)
        }
        this.params.refresh && this.params.refresh()
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
