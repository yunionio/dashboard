<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_983')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.sku')" :count="params.data.length" :action="$t('compute.text_983')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_177')" class="mb-0">
          <cloudregion-zone
            :zone-params="zoneParams"
            :cloudregion-params="cloudregionParams"
            :decorator="decorators.cloudregionZone" />
        </a-form-item>
        <a-form-item
          :label="$t('compute.text_228')"
          :help="nameRepeatedHelp"
          :validate-status="nameRepeatedValidateStatus">
          <a-input disabled v-decorator="decorators.name" />
        </a-form-item>
        <a-form-item :label="$t('compute.sys_disk_type')">
          <base-select
            v-decorator="decorators.sys_disk_type"
            :options="sysDiskTypeOptions"
            :select-props="{ placeholder: $t('common.tips.select', [$t('compute.sys_disk_type')]), mode: 'multiple' }" />
        </a-form-item>
        <a-form-item :label="$t('compute.data_disk_type')">
          <base-select
            v-decorator="decorators.data_disk_types"
            :options="dataDiskTypeOptions"
            :select-props="{ placeholder: $t('common.tips.select', [$t('compute.data_disk_type')]), mode: 'multiple' }" />
        </a-form-item>
        <a-form-item :label="$t('compute.sku.postpaid_status')">
          <a-radio-group v-decorator="decorators.postpaid_status">
            <a-radio value="available">{{ $t('status.sku.available') }}</a-radio>
            <a-radio value="soldout">{{ $t('status.sku.soldout') }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('compute.sku.prepaid_status')">
          <a-radio-group v-decorator="decorators.prepaid_status">
            <a-radio value="available">{{ $t('status.sku.available') }}</a-radio>
            <a-radio value="soldout">{{ $t('status.sku.soldout') }}</a-radio>
          </a-radio-group>
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import CloudregionZone from '@/sections/CloudregionZone'
import { isRequired } from '@/utils/validate'
import { STORAGE_TYPES } from '@Compute/constants'

export default {
  name: 'ClonePublicSkuUpdateDialog',
  components: {
    CloudregionZone,
  },
  mixins: [DialogMixin, WindowsMixin],
  provide () {
    return {
      form: this.form,
    }
  },
  data () {
    const initData = this.params.data[0] || {}
    const initSysDiskType = initData.sys_disk_type ? initData.sys_disk_type.split(',').filter(item => item) : []
    const initDataDiskTypes = initData.data_disk_types ? initData.data_disk_types.split(',').filter(item => item) : []
    return {
      loading: false,
      data: initData,
      nameRepeatedChecking: false,
      nameRepeatedInZone: false,
      nameRepeatedReqId: 0,
      form: {
        fd: {
          cloudregion: { key: initData.cloudregion_id || '', label: initData.cloudregion || '' },
          zone: { key: initData.zone_id || '', label: initData.zone || '' },
        },
      },
      decorators: {
        name: [
          'name',
          {
            initialValue: initData.name || '',
          },
        ],
        cloudregionZone: {
          cloudregion: [
            'cloudregion',
            {
              initialValue: { key: initData.cloudregion_id || '', label: initData.cloudregion || '' },
              rules: [
                { validator: isRequired(), message: this.$t('compute.text_212') },
              ],
            },
          ],
          zone: [
            'zone',
            {
              initialValue: { key: initData.zone_id || '', label: initData.zone || '' },
              rules: [
                { validator: isRequired(), message: this.$t('compute.text_213') },
              ],
            },
          ],
        },
        sys_disk_type: [
          'sys_disk_type',
          {
            initialValue: initSysDiskType,
            rules: [
              { required: false, message: this.$t('common.tips.select', [this.$t('compute.sys_disk_type')]) },
            ],
          },
        ],
        data_disk_types: [
          'data_disk_types',
          {
            initialValue: initDataDiskTypes,
            rules: [
              { required: false, message: this.$t('common.tips.select', [this.$t('compute.data_disk_type')]) },
            ],
          },
        ],
        postpaid_status: [
          'postpaid_status',
          {
            initialValue: initData.postpaid_status || 'available',
          },
        ],
        prepaid_status: [
          'prepaid_status',
          {
            initialValue: initData.prepaid_status || 'available',
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  computed: {
    zoneId () {
      return this.form?.fd?.zone?.key
    },
    cloudregionParams () {
      return {
        cloud_env: 'public',
        // usable: true,
        show_emulated: false,
        scope: this.$store.getters.scope,
        provider: this.data.provider,
      }
    },
    zoneParams () {
      return {
        // usable: true,
        show_emulated: false,
        order_by: 'created_at',
        cloudregion_id: this.form.fd.cloudregion.key,
        order: 'asc',
        scope: this.$store.getters.scope,
      }
    },
    allStorageTypes () {
      if (STORAGE_TYPES[(this.data.provider || '').toLowerCase()]) {
        return Object.values(STORAGE_TYPES[(this.data.provider || '').toLowerCase()]).map(item => {
          return {
            id: item.key || item.value,
            name: item.label,
            ...item,
          }
        })
      }
      return []
    },
    sysDiskTypeOptions () {
      // sysUnusable
      const ret = [...this.allStorageTypes].filter(item => !item.sysUnusable)
      if (this.data.sys_disk_type) {
        const list = this.data.sys_disk_type.split(',').filter(item => item)
        list.forEach(key => {
          if (!ret.some(item => item.id === key)) {
            ret.push({ id: key, name: key })
          }
        })
      }
      return ret
    },
    dataDiskTypeOptions () {
      const ret = [...this.allStorageTypes]
      if (this.data.data_disk_types) {
        const list = this.data.data_disk_types.split(',').filter(item => item)
        list.forEach(key => {
          if (!ret.some(item => item.id === key)) {
            ret.push({ id: key, name: key })
          }
        })
      }
      return ret
    },
    nameRepeatedHelp () {
      if (this.nameRepeatedChecking) return ''
      if (this.nameRepeatedInZone) return this.$t('compute.sku.name_repeated_in_zone')
      return ''
    },
    nameRepeatedValidateStatus () {
      if (this.nameRepeatedInZone) return 'error'
      return ''
    },
  },
  watch: {
    zoneId: {
      immediate: true,
      handler (val, oldVal) {
        if (val && val !== oldVal) {
          this.checkSkuNameRepeatedInZone()
        } else if (!val) {
          this.nameRepeatedInZone = false
        }
      },
    },
  },
  created () {
    // 在 created 钩子中创建表单，确保 form.fd 已经初始化
    this.form.fc = this.$form.createForm(this, {
      onValuesChange: (props, values) => {
        if (this.form && this.form.fd) {
          if (values.hasOwnProperty('cloudregion')) {
            this.form.fd.cloudregion = values.cloudregion
          }
          if (values.hasOwnProperty('zone')) {
            this.form.fd.zone = values.zone
          }
        }
      },
    })
  },
  methods: {
    async checkSkuNameRepeatedInZone () {
      const zoneId = this.zoneId
      const provider = this.data?.provider
      const name = this.data?.name
      if (!zoneId || !provider || !name) {
        this.nameRepeatedInZone = false
        return
      }

      const reqId = ++this.nameRepeatedReqId
      this.nameRepeatedChecking = true
      try {
        const manager = new this.$Manager('serverskus')
        const safeName = String(name).replace(/'/g, '\\\'')
        const { data: { data = [] } = {} } = await manager.list({
          params: {
            scope: this.$store.getters.scope,
            limit: 1,
            zone_id: zoneId,
            provider,
            filter: `name.equals('${safeName}')`,
          },
        })
        if (reqId === this.nameRepeatedReqId) {
          this.nameRepeatedInZone = data.length > 0
        }
      } catch (e) {
        if (reqId === this.nameRepeatedReqId) {
          // 请求失败时不阻断流程，默认不提示重名
          this.nameRepeatedInZone = false
        }
      } finally {
        if (reqId === this.nameRepeatedReqId) {
          this.nameRepeatedChecking = false
        }
      }
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
      const keys = ['hyperevisor', 'cpu_arch', 'cpu_core_count', 'instance_type_category', 'instance_type_family', 'local_category', 'memory_size_mb', 'name']
      try {
        let values = await this.validateForm()
        values = {
          cloudregion_id: this.form.fd.cloudregion.key,
          zone_id: this.form.fd.zone.key,
          sys_disk_type: values.sys_disk_type.join(','),
          data_disk_types: values.data_disk_types.join(','),
          postpaid_status: values.postpaid_status,
          prepaid_status: values.prepaid_status,
        }
        keys.forEach(key => {
          values[key] = values[key] || this.data[key]
        })
        this.loading = true
        await this.doCreate(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
