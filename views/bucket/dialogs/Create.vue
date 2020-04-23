<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item label="名称">
          <a-input placeholder="请输入名称" v-decorator="decorators.name" />
          <span slot="extra">
            4~62个字节，小写字母与数字开头和结尾，中间可以为：小写字母、数字、.-_:
            <br />Azure 不支持 -
          </span>
        </a-form-item>
         <a-form-item label="区域">
          <cloud-provider-region />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { formItemLayout } from '@Storage/constants/index.js'
import CloudProviderRegion from '@Storage/views/bucket/components/CloudProviderRegion'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'BucketCreateDialog',
  components: {
    CloudProviderRegion,
  },
  mixins: [DialogMixin, WindowsMixin],
  provide () {
    return {
      form: this.form,
    }
  },
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout,
    }
  },
  computed: {
    getFieldValue () {
      return this.form.fc.getFieldValue
    },
    decorators () {
      return {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入名称' },
              { validator: this.$validate('bucketName') },
            ],
          },
        ],
      }
    },
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (err) return reject(err)
          const { zone, cloudregion } = values
          if (zone) {
            values['zone'] = zone.key
          }
          if (cloudregion) {
            values['cloudregion'] = cloudregion.key
          }
          resolve(values)
        })
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        await this.params.list.onManager('create', {
          managerArgs: {
            data: values,
          },
        })
        this.cancelDialog()
        this.params.list.fetchData()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
