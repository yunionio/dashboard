<template>
  <div>
    <a-form
      class="mt-3"
      v-bind="formItemLayout"
      :form="form.fc"
      hideRequiredMark>
      <a-form-item :label="$t('storage.text_55', [$t('dictionary.project')])">
        <domain-project :fc="form.fc" :decorators="{ project: decorators.project, domain: decorators.domain }" />
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
      <area-selects
        class="mb-0"
        ref="areaSelects"
        :wrapperCol="formItemLayout.wrapperCol"
        :labelCol="formItemLayout.labelCol"
        :names="areaselectsName"
        :cloudregionParams="param.region"
        :zoneParams="param.zone"
        :providerParams="param.provider"
        :isRequired="true"
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
      <a-form-item :label="$t('storage.capacity')">
        <a-input-number v-decorator="decorators.capacity_gb" :min="1" :step="1" :precision="0" /> GB
      </a-form-item>
      <a-form-item :label="$t('compute.text_1154')" class="mb-0">
        <tag
          v-decorator="decorators.tag" :allowNoValue="false" />
      </a-form-item>
      <bottom-bar
        :values="form.fc.getFieldsValue()"
        @submit="handleConfirm"
        @cancel="handleCancel" />
    </a-form>
  </div>
</template>

<script>
import DomainProject from '@/sections/DomainProject'
import { formItemLayout } from '@Storage/constants'
import AreaSelects from '@/sections/AreaSelects'
import Tag from '@/sections/Tag'
import validateForm, { isRequired } from '@/utils/validate'
import BottomBar from '../components/BottomBar'
import fsCreateMixin from './mixin'

export default {
  name: 'FileSystemIDCCreate',
  components: {
    DomainProject,
    AreaSelects,
    Tag,
    BottomBar,
  },
  mixins: [fsCreateMixin],
  data () {
    return {
      formItemLayout,
      areaselectsName: ['cloudregion', 'zone'],
      regionList: [],
      zoneList: [],
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
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_218') },
              { validator: validateForm('serverName') },
            ],
          },
        ],
        description: ['description'],
        cloudregion: [
          'cloudregion',
          {
            initialValue: { key: '', label: '' },
            rules: [
              { validator: isRequired(), message: this.$t('network.text_286') },
            ],
          },
        ],
        zone: [
          'zone',
          {
            initialValue: { key: '', label: '' },
            rules: [
              { required: true, message: this.$t('storage.text_58') },
            ],
          },
        ],
        cloudprovider: [
          'cloudprovider',
          {
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('compute.text_653')]) },
            ],
          },
        ],
        capacity_gb: [
          'capacity_gb',
          {
            initialValue: 1,
          },
        ],
        tag: [
          'tag',
          {
            rules: [
              { validator: validateForm('tagName') },
            ],
          },
        ],
      },
    }
  },
  computed: {
    param () {
      const project_domain = { project_domain: this.form.fd.domain?.key || this.userInfo.projectDomainId || this.userInfo.domain.id }
      const params = {
        zone: {
          usable: true,
          show_emulated: true,
          order_by: 'created_at',
          order: 'asc',
          ...project_domain,
        },
        region: {
          usable: true,
          cloud_env: 'onpremise',
          show_emulated: true,
          ...project_domain,
        },
        provider: {},
      }
      return params
    },
    cloudproviderParams () {
      const params = {
        limit: 0,
        enabled: 1,
        details: true,
        scope: this.scope,
        read_only: false,
        cloudregion: this.form.fd.cloudregion,
      }
      if (this.isAdminMode) {
        params.admin = true
        params.project_domain = this.form.fd.domain?.key
        delete params.scope
        delete params.domain_id
      }
      return params
    },
  },
  methods: {
    providerMapper (data) {
      if (this.cloudEnv === 'onpremise') data = data.filter(item => item.provider !== 'VMware')
      return data
    },
    handleRegionChange (val) {
      if (val.cloudregion) {
        this.form.fc.setFieldsValue({
          cloudregion: val.cloudregion.id,
        })
      }
      if (val.zone) {
        this.form.fc.setFieldsValue({
          zone: val.zone.id,
        })
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const { name, project, domain, cloudprovider, capacity_gb, tag, ...rest } = values

        await new this.$Manager('file_systems').create({
          data: {
            ...rest,
            generate_name: name,
            __meta__: tag,
            project_domain: (domain && domain.key) || this.userInfo.projectDomainId,
            project_id: (project && project.key) || this.userInfo.projectId,
            cloudregion: this.form.fd.cloudregion,
            zone_id: this.form.fd.zone,
            manager_id: cloudprovider,
            file_system_type: 'standard',
            protocol: 'CephFS',
            storage_type: 'capacity',
            capacity: capacity_gb,
          },
        })
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

<style>
</style>
