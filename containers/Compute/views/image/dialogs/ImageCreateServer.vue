<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ action }}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :name="$t('dictionary.image')" :action="action" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.text_176')" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.platform">
            <a-radio-button v-for="obj in cloudEnvOpts" :value="obj.key" :key="obj.key" v-show="obj.key">
              {{ obj.label }}
            </a-radio-button>
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
import { IMAGES_TYPE_MAP } from '@/constants/compute'
import { getCloudEnvOptions } from '@/utils/common/hypervisor'

export default {
  name: 'ImageCreateServerDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.$t('compute.text_663'),
      cloudEnvOptions: getCloudEnvOptions('compute_engine_brands'),
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        platform: [
          'platform',
          {
            initialValue: 'idc',
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
    isISO () {
      return this.params.data.some((item) => {
        return item.disk_format === IMAGES_TYPE_MAP.iso.key
      })
    },
    cloudEnvOpts () {
      let cloudEnvOptions = this.cloudEnvOptions
      if (this.isISO) {
        cloudEnvOptions = cloudEnvOptions.filter((item) => { return item.key === 'onpremise' })
      }
      return cloudEnvOptions.map((item) => {
        if (item.key === 'onpremise') {
          return {
            ...item,
            key: 'idc',
          }
        }
        return item
      })
    },
  },
  methods: {
    handleConfirm () {
      const values = this.form.fc.getFieldsValue()
      const obj = this.params.data[0]
      const prop = obj.properties
      let os = prop.os_type
      let type = IMAGES_TYPE_MAP.standard.key
      if (prop.os_distribution) {
        os = prop.os_distribution.split(' ')[0]
      }
      if (obj.disk_format === IMAGES_TYPE_MAP.iso.key) {
        type = obj.disk_format
      } else {
        type = obj.is_standard ? IMAGES_TYPE_MAP.standard.key : IMAGES_TYPE_MAP.customize.key
      }
      this.$router.push({
        path: '/vminstance/create',
        query: {
          type: values.platform,
          imageId: obj.id,
          imageType: type,
          imageOs: os,
          sence: 'image',
          domain_id: obj.domain_id,
          tenant_id: obj.tenant_id,
          os_arch: obj.os_arch,
        },
      })
    },
  },
}
</script>
