<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">新建硬盘</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item :label="`指定${$t('dictionary.project')}`" class="mb-0" v-bind="formItemLayout">
          <domain-project :fc="form.fc" :decorators="{ project: decorators.project, domain: decorators.domain }" />
        </a-form-item>
        <a-form-item label="区域" class="mb-0" v-bind="formItemLayout">
          <cloudregion-zone
            :zone-params="par.zone"
            :cloudregion.sync="currentCloudregion"
            :cloudregion-params="par.region"
            :decorator="decorators.regionZone" />
        </a-form-item>
        <a-form-item label="名称" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceCreateName')" />
        </a-form-item>
        <a-form-item :label="storageLabel" v-bind="formItemLayout">
          <a-select v-decorator="decorators.backend" @change="__newStorageChange">
            <a-select-option v-for="item in storageOpts" :key="item.value">
              <div class="d-flex">
                <span class="text-truncate flex-fill mr-2" :title="item.label">{{ item.label }}</span>
                <!-- <span style="color: #8492a6; font-size: 13px" v-if="item.manager">云订阅: {{ item.manager }}</span> -->
              </div>
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="容量" v-bind="formItemLayout">
          <a-input-number :min="minDiskData" :max="maxDiskData" :step="step" v-decorator="decorators.size" /> GB
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
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import * as CommonConstants from '../../../constants'
import CloudregionZone from '@/sections/CloudregionZone'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { isRequired } from '@/utils/validate'
import i18n from '@/locales'
import DomainProject from '@/sections/DomainProject'
import { PROVIDER_MAP } from '@/constants'

export default {
  name: 'DiskCreateDialog',
  components: {
    CloudregionZone,
    DomainProject,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      currentCloudregion: {},
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.form.fd[key] = values[key]
            })
            if (values.hasOwnProperty('zone')) {
              if (values.zone && values.zone.key) {
                // this.fetchStorageList(values.zone.key)
                this.fetchNewStorageList(values.zone.key)
              }
            }
          },
        }),
        fd: {
          domain: '',
          project: '',
        },
      },
      decorators: {
        domain: [
          'domain',
          {
            rules: [
              { validator: isRequired(), message: i18n.t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            rules: [
              { validator: isRequired(), message: i18n.t('rules.project'), trigger: 'change' },
            ],
          },
        ],
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入名称' },
              { validator: this.$validate('resourceCreateName') },
            ],
          },
        ],
        backend: [
          'backend',
          {
            rules: [
              { required: true, message: '请选择存储类型' },
            ],
          },
        ],
        storage_id: [
          'storage_id',
          {
            rules: [
              { required: true, message: '请选择存储类型' },
            ],
          },
        ],
        size: [
          'size',
          {
            initialValue: 10,
            rules: [
              { required: true },
            ],
          },
        ],
        regionZone: {
          cloudregion: [
            'cloudregion',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { required: true, message: '请选择区域' },
              ],
            },
          ],
          zone: [
            'zone',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { required: true, message: '请选择可用区' },
              ],
            },
          ],
        },
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      param: {
        zone: {},
        region: {
          usable: true,
          cloud_env: 'onpremise',
        },
      },
      storageOpts: [],
      storageItem: {},
      maxDiskData: 2048,
      minDiskData: 1,
      step: 10,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'userInfo']),
    provider () { // 向外提供的，通过 refs 获取
      if (this.currentCloudregion && this.currentCloudregion.provider) {
        return this.currentCloudregion.provider.toLowerCase()
      }
      return ['kvm', 'esxi'] // 没有 provider 肯定是 kvm 或者 esxi 的cloudregion
    },
    diskType () {
      return this.params.diskType
    },
    storageLabel () {
      if (['idc', 'private'].includes(this.diskType)) {
        return '存储类型'
      }
      return '介质类型'
    },
    par () {
      const project_domain = { project_domain: this.form.fd.domain.key || this.userInfo.domain.id }
      if (this.diskType === 'private') {
        return {
          zone: {
            usable: true,
            show_emulated: true,
            order_by: 'created_at',
            order: 'asc',
            ...project_domain,
          },
          region: {
            usable: true,
            cloud_env: 'private',
            show_emulated: true,
            ...project_domain,
          },
        }
      } else if (this.diskType === 'public') {
        return {
          zone: {
            usable: true,
            show_emulated: true,
            order_by: 'created_at',
            order: 'asc',
            ...project_domain,
          },
          region: {
            usable: true,
            cloud_env: 'public',
            ...project_domain,
          },
        }
      }
      if (this.isAdminMode) {
        return {
          zone: {
            ...project_domain,
          },
          region: {
            usable: true,
            cloud_env: 'onpremise',
            ...project_domain,
          },
        }
      }
      return {
        zone: {
          ...project_domain,
        },
        region: {
          usable: true,
          cloud_env: 'onpremise',
          scope: this.scope,
        },
      }
    },
  },
  provide () {
    return {
      form: this.form,
    }
  },
  methods: {
    fetchStorageList (zoneId) {
      const params = {
        usable: true,
        share: true,
        details: true,
        show_emulated: true,
        // project_domain: this.form.fd.domain.key || this.userInfo.domain.id,
        scope: this.scope,
      }
      this.storageOpts = []
      new this.$Manager('storages').list({ ctx: [['zones', zoneId]], params })
        .then(({ data: { data } = { data: [] } }) => {
          try {
            this.storageOpts = this._translateStorageOps(data)
            this.form.fc.setFieldsValue({ storage_id: '' })
            if (this.storageOpts.length > 0) {
              this.form.fc.setFieldsValue({ storage_id: this.storageOpts[0].value })
              this.__storageChange(this.storageOpts[0].value)
            }
          } catch (error) {
            throw new Error('存储类型解析出错：' + error)
          }
        })
    },
    fetchNewStorageList (zoneId) {
      const params = { show_emulated: true, scope: this.scope }
      this.storageOpts = []
      new this.$Manager('capability').list({ ctx: [['zones', zoneId]], params })
        .then(({ data }) => {
          try {
            const provider = Array.isArray(this.provider) ? this.provider[0] : this.provider
            this.storageOpts = data.data_storage_types.map((item) => {
              const type = item.split('/')[0]
              const storageType = CommonConstants.STORAGE_TYPES[provider][type]
              const getLabel = (type) => { return type.includes('rbd') ? 'Ceph' : type }
              return {
                value: type,
                label: storageType ? storageType.label : getLabel(type),
              }
            })
            if (this.diskType === 'idc') {
              this.storageOpts = this.storageOpts.filter((item) => {
                return item.value !== 'local'
              })
            } else if (this.diskType === 'private') {
              this.storageOpts = this.storageOpts.filter((item) => {
                return item.value !== 'nova'
              })
            }
            if (provider === 'qcloud') {
              this.storageOpts = this.storageOpts.filter((item) => {
                return !item.value.startsWith('local_')
              })
            }
            this.form.fc.setFieldsValue({ backend: '' })
            if (this.storageOpts.length > 0) {
              this.form.fc.setFieldsValue({ backend: this.storageOpts[0].value })
              this.__newStorageChange(this.storageOpts[0].value)
            }
          } catch (error) {
            throw new Error('存储类型获取出错：' + error)
          }
        })
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    doCreate (data) {
      return this.params.onManager('create', {
        managerArgs: {
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.validateForm()
        const { project, domain, cloudregion, zone, ...rest } = values
        const oProvider = PROVIDER_MAP[this.currentCloudregion.provider]
        const provider = Array.isArray(this.provider) ? this.provider[0] : this.provider
        values = {
          ...rest,
          hypervisor: oProvider ? oProvider.hypervisor : provider,
          size: values.size * 1024,
          project_domain: (domain && domain.key) || this.userInfo.projectDomainId,
          project_id: (project && project.key) || this.userInfo.projectId,
          prefer_region: cloudregion && cloudregion.key,
          prefer_zone: zone && zone.key,
        }
        Reflect.deleteProperty(values, 'cloudregion')
        Reflect.deleteProperty(values, 'zone')
        await this.doCreate(values)
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    _translateStorageOps (data) {
      const findStorageProvider = optItem => {
        const storageName = optItem.name ? `(${optItem.name})` : ''
        let storageType = optItem.storage_type
        let storageProvider = {}
        if (R.is(Array, this.provider)) {
          this.provider.forEach(hypervisor => { // 将 kvm 和 esxi 的存储类型合一
            Object.assign(storageProvider, CommonConstants.STORAGE_TYPES[hypervisor])
          })
        } else {
          storageProvider = CommonConstants.STORAGE_TYPES[this.provider]
        }
        if (storageProvider[storageType.toLowerCase()]) {
          storageType = storageType.toLowerCase()
        } else if (storageProvider[storageType.toUpperCase()]) {
          storageType = storageType.toUpperCase()
        }
        return {
          storageName,
          storageType,
          storageProvider,
        }
      }
      // 过滤掉不支持创建的云硬盘的存储类型
      const conCreateCloud = data.filter(v => {
        const { storageProvider, storageType } = findStorageProvider(v)
        if (storageType === 'nova') return false
        if (storageType && storageProvider && !R.isEmpty(storageProvider) && storageProvider[storageType]) {
          return !storageProvider[storageType].unCreateCloud
        }
        // 说明支持自定义
        if (CommonConstants.CUSTOM_STORAGE_TYPES.includes(this.provider)) {
          return true
        }
        return false
      })
      return conCreateCloud.map(v => {
        const { storageName, storageType, storageProvider } = findStorageProvider(v)
        let label = v.name
        try {
          if (storageProvider[storageType]) {
            label = storageProvider[storageType].label
          } else {
            label = storageProvider[storageType.toLowerCase()].label
          }
        } catch (error) {
          console.warn(`没有找到 ${this.provider} 下面的 ${storageType}`)
        }
        return {
          label: `${label}${storageName}`,
          value: v.id,
          ...v,
        }
      })
    },
    __storageChange (storageId) {
      const item = this.storageOpts.find(v => v.value === storageId)
      this.storageItem = item
      const provider = item.provider.toLowerCase()
      try {
        const storageItem = CommonConstants.STORAGE_TYPES[provider]
        if (storageItem && storageItem[item.storage_type]) {
          this.minDiskData = CommonConstants.STORAGE_TYPES[provider][item.storage_type].min
          this.maxDiskData = CommonConstants.STORAGE_TYPES[provider][item.storage_type].max
        } else {
          this.minDiskData = 1
          this.maxDiskData = 2048
        }
      } catch (error) {
        console.warn(`没有找到 ${CommonConstants.STORAGE_TYPES[provider]} 下面的 ${item.storage_type}`)
      }
      this.form.fc.setFieldsValue({ size: 10 })
      const size = this.form.fc.getFieldValue('size')
      if (size > this.maxDiskData) { // 如果当前容量大于当前集群的最大值，那么取最大值
        this.form.fc.setFieldsValue({ size: this.maxDiskData })
      } else if (size < this.minDiskData) { // 如果当前容量小于当前集群的最大值，那么取最小值
        this.form.fc.setFieldsValue({ size: this.minDiskData })
      }
    },
    __newStorageChange (val) {
      const item = this.storageOpts.find(v => v.value === val)
      this.storageItem = item
      try {
        const storageItem = CommonConstants.STORAGE_TYPES[this.provider]
        if (storageItem && storageItem[item.value]) {
          this.minDiskData = CommonConstants.STORAGE_TYPES[this.provider][item.value].min
          this.maxDiskData = CommonConstants.STORAGE_TYPES[this.provider][item.value].max
        } else {
          this.minDiskData = 1
          this.maxDiskData = 2048
        }
      } catch (error) {
        console.warn(`没有找到 ${CommonConstants.STORAGE_TYPES[this.provider]} 下面的 ${item.storage_type}`)
      }
      this.form.fc.setFieldsValue({ size: 10 })
      const size = this.form.fc.getFieldValue('size')
      if (size > this.maxDiskData) { // 如果当前容量大于当前集群的最大值，那么取最大值
        this.form.fc.setFieldsValue({ size: this.maxDiskData })
      } else if (size < this.minDiskData) { // 如果当前容量小于当前集群的最大值，那么取最小值
        this.form.fc.setFieldsValue({ size: this.minDiskData })
      }
    },
  },
}
</script>
