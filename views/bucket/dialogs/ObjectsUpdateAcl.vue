<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="this.params.title" name="文件" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item label="读写权限">
          <a-radio-group v-decorator="decorators.acl">
            <a-radio-button v-for="(v, k) in $t('storageAclTypes')" :key="k" :value="k">{{v}}</a-radio-button>
          </a-radio-group>
          <div slot="extra">
          本账号读写：只有用户本人可读写指定Bucket中的数据<br />
          本账号写公开读：任何用户均可读取Bucket中的数据，写操作需进行身份验证<br />
          公开读写：所有人均可读写Bucket内的Object，无需身份验证。该权限安全风险极高，为确保您的数据安全，请谨慎选择<br />
        </div>
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ObjectsUpdateAclDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      formItemLayout,
      fileList: [],
      form: {
        fc: this.$form.createForm(this),
      },
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  computed: {
    decorators () {
      return {
        acl: ['acl', {
          initialValue: this.params.data[0].acl,
        }],
      }
    },
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (err) return reject(err)
          resolve(values)
        })
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const { acl } = await this.validateForm()
        const { resName, data } = this.params
        const key = data.map(({ key }) => key).filter((t) => !!t)
        const params = {
          acl,
        }
        if (key && key.length > 0) {
          params['key'] = key
        }
        await new this.$Manager('buckets', 'v2').performAction({
          id: resName,
          action: 'acl',
          data: params,
        })
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
