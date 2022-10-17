<template>
  <div>
    <page-header :title="$t('compute.modelarts.create')" />
    <page-body needMarginBottom>
      <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout" hideRequiredMark>
        <a-form-item class="mb-0" :label="$t('compute.text_297', [$t('dictionary.project')])">
          <domain-project :decorators="decorators.projectDomain" :fc="form.fc" :labelInValue="false" />
        </a-form-item>
        <area-selects
          class="mb-0"
          ref="areaSelects"
          :wrapperCol="formItemLayout.wrapperCol"
          :labelCol="formItemLayout.labelCol"
          :names="['provider', 'cloudregion']"
          :cloudregionParams="cloudregionParams"
          :isRequired="true"
          :providerParams="providerParams"
          filterBrandResource="modelarts_pools"
          @change="handleRegionChange" />
        <a-form-item :label="$t('compute.text_15')">
          <base-select
            resource="cloudproviders"
            v-decorator="decorators.cloudprovider"
            :params="cloudproviderParams"
            :isDefaultSelect="true"
            :showSync="true"
            :select-props="{ placeholder: $t('compute.text_149') }" />
        </a-form-item>
        <a-form-item :label="$t('common.name')">
          <a-input v-decorator="decorators.name" />
          <template v-slot:extra>
            <name-repeated res="modelarts_pools" :name="form.fd.name" :default-text="$t('compute.text_893')" />
          </template>
        </a-form-item>
        <a-form-item :label="$t('common.description')">
          <a-input v-decorator="decorators.description" />
        </a-form-item>
        <a-form-item :label="$t('compute.modelarts.work_type')">
          <a-checkbox-group v-decorator="decorators.work_type">
            <a-checkbox v-for="item of WORK_TYPES" :value="item.key" :key="item.key">{{ item.label }}</a-checkbox>
          </a-checkbox-group>
        </a-form-item>
        <a-form-item :label="$t('compute.modelarts.spec_arch')">
          <a-row>
            <a-col :span="4">
              <a-radio-group v-decorator="decorators.spec" @change="specChangeHandle">
                <a-radio-button v-for="item of SPECS" :value="item.key" :key="item.key">
                  {{ item.label }}
                </a-radio-button>
              </a-radio-group>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="4">
              <a-radio-group v-decorator="decorators.arch" @change="archChangeHandle">
                <a-radio-button v-for="item of archOpts" :value="item.key" :key="item.key">
                  {{ item.label }}
                </a-radio-button>
              </a-radio-group>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="8">
              <a-select v-decorator="decorators.sku" :loading="skuLoading">
                <a-select-option v-for="item of skuOptions" :key="item.key" :value="item.key">{{ item.label }}</a-select-option>
              </a-select>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item :label="$t('compute.modelarts.zone')">
          <a-radio-group v-decorator="decorators.zone_type">
            <a-radio-button v-for="item of ZONE_TYPES" :value="item.key" :key="item.key">
              {{ item.label }}
            </a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('compute.modelarts.bill_type')">
          <a-radio-group v-decorator="decorators.bill_type">
            <a-radio-button v-for="item of BILL_TYPES" :value="item.key" :key="item.key">
              {{ item.label }}
            </a-radio-button>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button class="mr-3" type="primary" @click="handleConfirm" :loading="loading">{{$t('compute.text_907')}}</a-button>
        <a-button @click="handleCancel">{{$t('compute.text_908')}}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import DomainProject from '@/sections/DomainProject'
import { sizestr } from '@/utils/utils'
import { Manager } from '@/utils/manager'
import NameRepeated from '@/sections/NameRepeated'
import AreaSelects from '@/sections/AreaSelects'
import {
  SPECS,
  SPEC_MAP,
  WORK_TYPES,
  SPEC_ARCH_MAP,
  ARCH_MAP,
  ZONE_TYPES,
  ZONE_TYPE_MAP,
  BILL_TYPES,
  BILL_TYPE_MAP,
} from '../constants'

export default {
  name: 'ModelArtsCreate',
  components: {
    DomainProject,
    NameRepeated,
    AreaSelects,
  },
  data () {
    return {
      SPECS,
      WORK_TYPES,
      SPEC_ARCH_MAP,
      ARCH_MAP,
      ZONE_TYPES,
      BILL_TYPES,
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
        cloudprovider: [
          'cloudprovider',
          {
            rules: [
              { required: true, message: this.$t('network.text_689') },
            ],
          },
        ],
        name: [
          'name',
          {
            rules: [
              { required: true, message: `${this.$t('common.placeholder')}${this.$t('common.name')}` },
              // { validator: this.$validate('resourceName') },
            ],
          },
        ],
        description: [
          'description',
        ],
        work_type: [
          'work_type',
          {
            rules: [
              { required: true, message: `${this.$t('common.placeholder')}${this.$t('compute.modelarts.work_type')}` },
            ],
          },
        ],
        spec: [
          'spec',
          {
            initialValue: SPEC_MAP.x86.key,
          },
        ],
        arch: [
          'arch',
          {
            initialValue: ARCH_MAP.CPU.key,
          },
        ],
        sku: [
          'sku',
        ],
        zone_type: [
          'zone_type',
          {
            initialValue: ZONE_TYPE_MAP.random.key,
          },
        ],
        bill_type: [
          'bill_type',
          {
            initialValue: BILL_TYPE_MAP.postpaid.key,
          },
        ],
      },
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.form.fd[key] = values[key]
            })
          },
        }),
        fd: {
          name: '',
          cloudprovider: '',
          spec: 'x86',
          arch: 'CPU',
        },
      },
      formItemLayout: {
        wrapperCol: {
          md: { span: 16 },
          xl: { span: 18 },
          xxl: { span: 20 },
        },
        labelCol: {
          md: { span: 8 },
          xl: { span: 6 },
          xxl: { span: 4 },
        },
      },
      skuOptions: [],
      skuLoading: false,
      cloudregionParams: {
        usable: true,
        cloud_env: 'public',
      },
      providerParams: {
        cloud_env: 'public',
        brand: 'Huawei',
      },
      regionProvider: '',
      regionId: '',
    }
  },
  computed: {
    cloudproviderParams () {
      return {
        cloudregion: this.regionId,
      }
    },
    archOpts () {
      return this.SPEC_ARCH_MAP[this.form.fd.spec]
    },
  },
  watch: {
    'form.fd.cloudprovider' (val) {
      this.fetchSkus()
    },
    'regionId' (val) {
      this.fetchSkus()
    },
  },
  created () {
    this.fetchSkus()
  },
  methods: {
    handleRegionChange (data) {
      const { cloudregion } = data
      if (cloudregion) {
        const { provider } = cloudregion.value
        this.regionProvider = provider
        this.regionId = cloudregion.id
      }
    },
    getArch (item, arch) {
      const memory = sizestr(item.memory, 'M', 1024)
      if (arch === ARCH_MAP.CPU.key) {
        return `${ARCH_MAP.CPU.label}:${this.$t('compute.text_120', [item.cpu_count || 0])}${memory}`
      } else if (arch === ARCH_MAP.GPU.key) {
        return `${ARCH_MAP.GPU.label}:${this.$t('compute.text_120', [item.gpu_size || 0])}${memory}`
      } else if (arch === ARCH_MAP.Ascend.key) {
        return `${ARCH_MAP.Ascend.label}:${this.$t('compute.text_120', [item.npu_size || 0])}${memory}`
      }
    },
    clearSku () {
      this.form.fc.setFieldsValue({ sku: undefined })
    },
    chooseFirstSku (sku) {
      this.form.fc.setFieldsValue({ sku })
    },
    async fetchSkus (arch = 'CPU') {
      if (!this.regionId || !this.form.fd.cloudprovider) return
      try {
        this.clearSku()
        this.skuLoading = true
        const manager = new Manager('modelarts_pool_skus')
        const { data } = await manager.list({
          params: {
            cloudregion: this.regionId,
            manager: this.form.fd.cloudprovider,
            filter: `name.like(%${arch}%)`,
            details: true,
            'order_by.0': 'cpu_count',
            'order_by.1': 'memory',
            order: 'asc',
          },
        })
        this.skuOptions = data.data.map(item => {
          return {
            key: item.name,
            label: `${this.getArch(item, arch)}(${item.name})`,
          }
        })
        this.chooseFirstSku(this.skuOptions[0]?.key)
      } catch (error) {
        this.skuOptions = []
        throw error
      } finally {
        this.skuLoading = false
      }
    },
    generateValues (values) {
      const data = {
        generate_name: values.name,
        manager_id: values.cloudprovider,
        cloudregion: this.regionId,
        instance_type: values.sku,
        work_type: values.work_type.join(','),
        cpu_arch: values.spec,
        project_id: values.project,
      }
      return data
    },
    handleCancel () {
      this.$router.push({
        name: 'ModelArts',
      })
    },
    async handleConfirm () {
      const { validateFields } = this.form.fc
      const manager = new Manager('modelarts_pools')
      try {
        const values = await validateFields()
        this.loading = true
        await manager.create({
          data: Object.assign({}, this.generateValues(values)),
        })
        this.handleCancel()
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
    specChangeHandle (e) {
      const arch = this.SPEC_ARCH_MAP[e.target.value][0].key
      this.form.fc.setFieldsValue({ arch })
      this.fetchSkus(arch)
    },
    archChangeHandle (e) {
      const arch = e.target.value
      this.fetchSkus(arch)
    },
  },
}
</script>

<style>

</style>
