<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="this.params.title" name="文件" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="key" v-for="(val, key) in TYPES" :key="key">
           <a-input :placeholder="val"  v-decorator="[key, getOption(key)]" />
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ObjectsUpdateHttpDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      formItemLayout: {
        labelCol: { span: 5 },
        wrapperCol: { span: 19 },
      },
      fileList: [],
      form: {
        fc: this.$form.createForm(this),
      },
      TYPES: {
        'Content-Type': '',
        'Content-Encoding': '编码',
        'Content-Language': '语言',
        'Content-Disposition': '内容呈现方式，inline表示可以在浏览器中和页面内容一起显示（如图片），attachment表示是下载的内容',
        'Cache-Control': '缓存控制',
      },
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  methods: {
    getOption (k) {
      const { data } = this.params
      return {
        initialValue: data[0].meta && data[0].meta[k] ? data[0].meta[k].toString() : undefined,
      }
    },
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
        const valies = await this.validateForm()
        for (const k in valies) {
          if (!valies[k]) {
            delete valies[k]
          } else {
            valies[k] = [valies[k]]
          }
        }
        const { resName, data } = this.params
        await new this.$Manager('buckets', 'v2').performAction({
          id: resName,
          action: 'metadata',
          data: {
            key: data.map(({ key }) => key),
            metadata: valies,
          },
        })
        this.params.list.fetchData()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
