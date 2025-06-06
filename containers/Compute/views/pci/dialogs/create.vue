<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('common.create') }}</div>
    <div slot="body">
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('compute.pci.dev_type')">
          <a-input v-decorator="decorators.dev_type" :placeholder="$t('compute.pci.dev_type.placeholder')" />
        </a-form-item>
        <a-form-item :label="$t('compute.pci.model')">
          <a-input v-decorator="decorators.model" :placeholder="$t('compute.pci.model.placeholder')" />
        </a-form-item>
        <a-form-item :label="$t('compute.pci.vendor_id')">
          <template #extra>
            {{ $t('compute.pci.vendor_id.extra') }}<help-link v-if="vendorAndDeviceLink" :href="vendorAndDeviceLink">{{ $t('compute.pci.document') }}</help-link>
          </template>
          <a-input v-decorator="decorators.vendor_id" :placeholder="$t('compute.pci.vendor_id.placeholder')" />
        </a-form-item>
        <a-form-item :label="$t('compute.pci.device_id')">
          <template #extra>
            {{ $t('compute.pci.device_id.extra') }}<help-link v-if="vendorAndDeviceLink" :href="vendorAndDeviceLink">{{ $t('compute.pci.document') }}</help-link>
          </template>
          <a-input v-decorator="decorators.device_id" :placeholder="$t('compute.pci.device_id.placeholder')" />
        </a-form-item>
        <a-form-item :label="$t('compute.pci.disable_auto_detect')">
          <a-switch v-decorator="decorators.disable_auto_detect" :checked-children="$t('table.title.on')" :un-checked-children="$t('table.title.off')" />
        </a-form-item>
        <a-form-item v-if="!form.fd.disable_auto_detect" :label="$t('compute.pci.host')" :extra="$t('compute.pci.host.extra')">
          <list-select
            v-decorator="decorators.hosts"
            :list-props="resourceProps"
            :formatter="v => v.name"
            :multiple="true"
            :placeholder="$t('compute.pci.host.placeholder')"
            :dialog-params="{ title: $t('compute.text_111'), width: 1060 }" />
        </a-form-item>
        <a-form-item :label="$t('compute.pci.hot_pluggable')" :extra="$t('compute.pci.hot_pluggable.tips')">
          <!-- <span slot="label">
            {{ $t('compute.pci.hot_pluggable') }}&nbsp;
            <a-tooltip :title="$t('compute.pci.hot_pluggable.tips')">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span> -->
          <a-switch v-decorator="decorators.hot_pluggable" :checked-children="$t('table.title.on')" :un-checked-children="$t('table.title.off')" />
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
import { genDocsUrl } from '@/utils/utils'
import { typeClouds } from '@/utils/common/hypervisor'
import ListSelect from '@/sections/ListSelect'
import ResourcePropsMixin from '../mixins/resourceProps'

export default {
  name: 'PciCreateDialog',
  components: {
    ListSelect,
  },
  mixins: [DialogMixin, WindowsMixin, ResourcePropsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.form.fd[key] = values[key]
            })
          },
        }),
        fd: {},
      },
      decorators: {
        dev_type: [
          'dev_type',
          {
            rules: [
              { required: true, message: this.$t('compute.pci.dev_type.placeholder') },
            ],
          },
        ],
        model: [
          'model',
          {
            rules: [
              { required: true, message: this.$t('compute.pci.model.placeholder') },
            ],
          },
        ],
        vendor_id: [
          'vendor_id',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.pci.vendor_id.placeholder') },
              { validator: this.validateVendorId(), trigger: 'blur' },
            ],
          },
        ],
        device_id: [
          'device_id',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.pci.device_id.placeholder') },
              { validator: this.validateDeviceId(), trigger: 'blur' },
            ],
          },
        ],
        hosts: [
          'hosts',
        ],
        hot_pluggable: [
          'hot_pluggable',
          {
            initialValue: false,
          },
        ],
        disable_auto_detect: [
          'disable_auto_detect',
          {
            initialValue: false,
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
      hostParams: {
        details: false,
        baremetal: false,
        brand: typeClouds.brandMap.OneCloud.brand,
      },
    }
  },
  computed: {
    vendorAndDeviceLink () {
      const lang = this.$store.getters.setting.language
      if (lang === 'zh-CN') {
        return genDocsUrl({
          scope: this.$store.getters.scope,
          isSysCE: this.$store.getters.isSysCE,
          cePath: 'guides/onpremise/vminstance/passthrough/custom-pci-devices',
          eePath: 'web_ui/computing/resources/gpu/#自定义透传设备类型',
        })
      }
      return null
    },
  },
  methods: {
    validateVendorId () {
      return (rule, value, callback) => {
        const reg = /^[a-f0-9]{4}$/
        if (reg.test(value)) {
          return callback()
        }
        return callback(new Error(this.$t('compute.pci.vendor_id.reg_error_msg')))
      }
    },
    validateDeviceId () {
      return (rule, value, callback) => {
        const reg = /^[a-f0-9]{4}$/
        if (reg.test(value)) {
          return callback()
        }
        return callback(new Error(this.$t('compute.pci.device_id.reg_error_msg')))
      }
    },
    doSubmit (data) {
      return new this.$Manager('isolated_device_models').create({
        data,
      })
    },
    async handleConfirm () {
      const { validateFields } = this.form.fc
      try {
        this.loading = true
        const values = await validateFields()
        const data = {
          dev_type: values.dev_type.trim(),
          model: values.model.trim(),
          vendor_id: values.vendor_id.trim(),
          device_id: values.device_id.trim(),
          hosts: values.hosts,
          hot_pluggable: values.hot_pluggable,
          disable_auto_detect: values.disable_auto_detect,
        }
        await this.doSubmit(data)
        this.loading = false
        this.cancelDialog()
        this.params.refresh && this.params.refresh()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
