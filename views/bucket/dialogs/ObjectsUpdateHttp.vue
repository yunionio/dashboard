<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="this.params.title" :name="$t('storage.text_112')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="key" v-for="(val, key) in TYPES" :key="key">
          <a-input :placeholder="val" v-decorator="decorators[key]" />
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
    const TYPES = {
      'Content-Type': '',
      'Content-Encoding': this.$t('storage.text_113'),
      'Content-Language': this.$t('storage.text_114'),
      'Content-Disposition': this.$t('storage.text_115'),
      'Cache-Control': this.$t('storage.text_116'),
    }
    const decorators = {}
    const { data } = this.params
    const meta = data[0].meta
    Object.keys(TYPES).forEach(item => {
      decorators[item] = [
        item,
        {
          initialValue: meta && meta[item] ? meta[item].toString() : undefined,
        },
      ]
    })
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
      TYPES,
      decorators,
    }
  },
  provide () {
    return {
      form: this.form,
    }
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
