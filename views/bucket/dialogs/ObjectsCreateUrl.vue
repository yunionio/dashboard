<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item label="链接有效时间" v-if="isPrivate">
          <a-input class="w-50" @change="getUrl" v-decorator="decorators.expire_seconds" placeholder="请输入整数">
            <span slot="addonAfter">秒</span>
          </a-input>
          <span slot="extra">您可以设置链接地址可访问的有效时间，访问者可以在有效时间内，通过此链接访问该文件。</span>
        </a-form-item>
        <a-form-item label="URL">
           <a-textarea :value="url || '暂无URL'" :disabled="true" autosize />
           <a style="font-size: 12px" v-clipboard:copy="url">复制文件URL<copy v-if="url" class="ml-1" :message="url" /></a>
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="cancelDialog" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { formItemLayout } from '@Storage/constants/index.js'
import { objectsModel } from '@Storage/views/bucket/utils/controller.js'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ObjectsCreateUrlDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      formItemLayout,
      fileList: [],
      url: '',
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
        expire_seconds: ['expire_seconds', {
          initialValue: 7200,
          validateFirst: true,
          rules: [
            { type: 'integer', message: '请输入整数', transform: (v) => parseFloat(v) },
          ],
        }],
      }
    },
    isPrivate () {
      return this.params.data[0].acl === 'private'
    },
  },
  mounted () {
    this.getUrl()
  },
  methods: {
    async getUrl (e) {
      try {
        await this.form.fc.validateFields()
        let seconds = 7200
        if (e && e.target) {
          seconds = parseInt(e.target.value) || 0
        }
        const { data, resName, accessUrl } = this.params
        const row = data && data.length > 0 ? data[0] : {}
        const url = await objectsModel.getUrl(Object.assign({}, row, { expire_seconds: seconds }), resName, accessUrl)
        this.url = url
      } catch (err) {
        throw err
      }
    },
    // handleConfirm () {
    // },
  },
}
</script>
