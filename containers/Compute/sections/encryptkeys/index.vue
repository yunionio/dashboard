<template>
  <div>
    <a-form-item class="mb-0">
      <a-radio-group v-decorator="decorators.encryptEnable" @change="change">
        <a-radio-button value="">{{ $t('compute.text_116') }}</a-radio-button>
        <a-radio-button value="new">{{ $t('compute.prompt.encrypt.new') }}</a-radio-button>
        <a-radio-button value="existing">{{ $t('compute.prompt.encrypt.existing') }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-if="showAlgs">
      <a-radio-group v-decorator="decorators.encrypt_key_alg" @change="onEncryptFieldChange">
        <a-radio-button value="">{{ $t('compute.text_1') }}</a-radio-button>
        <a-radio-button value="aes-256">AES256</a-radio-button>
        <!--a-radio-button value="sm4">SM4</a-radio-button-->
      </a-radio-group>
    </a-form-item>
    <a-form-item v-if="showKeys">
      <a-select v-decorator="decorators.encrypt_key_id" :placeholder="$t('compute.prompt.encrypt_key')" @change="onEncryptFieldChange">
        <a-select-option v-for="item in encryptKeyOptions" :key="item.value" :value="item.value">
          {{item.text}}
        </a-select-option>
      </a-select>
    </a-form-item>
  </div>
</template>

<script>
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'

export default {
  name: 'EncryptKeys',
  mixins: [createFormFieldDraftMixin],
  props: {
    formDraftKey: {
      type: String,
      default: '',
    },
    form: {
      type: Object,
      validator: val => !val || val.fc,
    },
    decorators: {
      type: Object,
      required: true,
      validator: val => {
        if (val.encryptEnable === 'existing' && !val.encrypt_key_id) {
          return false
        }
        if (val.encryptEnable === 'new' && !val.encrypt_key_alg) {
          return false
        }
        return true
      },
    },
  },
  data () {
    return {
      showKeys: this.decorators.encryptEnable[1].initialValue === 'existing',
      showAlgs: this.decorators.encryptEnable[1].initialValue === 'new',
      encryptKeyOptions: [],
    }
  },
  created () {
    this._encryptDraftRestoring = false
    this.fetchEncryptKeyOptions()
  },
  methods: {
    fieldName (dec) {
      return Array.isArray(dec) ? dec[0] : dec
    },
    getCreateFormFieldDraftSnapshot () {
      const fc = this.form && this.form.fc
      if (!fc) return undefined
      const enableKey = this.fieldName(this.decorators.encryptEnable)
      const algKey = this.fieldName(this.decorators.encrypt_key_alg)
      const idKey = this.fieldName(this.decorators.encrypt_key_id)
      const encryptEnable = fc.getFieldValue(enableKey) || ''
      // 未开启：清空草稿，避免旧值残留，也不因子字段强制展开高级配置
      if (!encryptEnable) {
        return null
      }
      const ret = { encryptEnable }
      if (encryptEnable === 'new') {
        ret.encrypt_key_alg = fc.getFieldValue(algKey) || ''
      }
      if (encryptEnable === 'existing') {
        const id = fc.getFieldValue(idKey)
        if (id) ret.encrypt_key_id = id
      }
      return ret
    },
    persistFormFieldDraftSnapshot (options = {}) {
      if (this._encryptDraftRestoring) return
      const data = this.serializeFormFieldDraft()
      if (data === null || data === undefined) {
        this.clearFormFieldDraft()
        return
      }
      this.writeFormFieldDraft(data, options)
    },
    flushFormFieldDraftOnSubmit () {
      const data = this.serializeFormFieldDraft()
      if (data === null || data === undefined) {
        this.clearFormFieldDraft()
        return
      }
      this.writeFormFieldDraft(data, { fromSubmit: true })
    },
    applyCreateFormFieldDraft (draft) {
      if (!draft || !this.form || !this.form.fc) return
      this._encryptDraftRestoring = true
      const run = () => {
        if (!this.tryApplyEncryptDraft(draft)) return
        this._encryptDraftRestoring = false
      }
      this.$nextTick(run)
      // options 异步就绪后再补写 existing key
      setTimeout(run, 800)
      setTimeout(() => {
        run()
        this._encryptDraftRestoring = false
      }, 2000)
    },
    tryApplyEncryptDraft (draft) {
      if (!draft || !this.form || !this.form.fc) return true
      const enableKey = this.fieldName(this.decorators.encryptEnable)
      const algKey = this.fieldName(this.decorators.encrypt_key_alg)
      const idKey = this.fieldName(this.decorators.encrypt_key_id)
      const encryptEnable = draft.encryptEnable || ''
      this.showKeys = encryptEnable === 'existing'
      this.showAlgs = encryptEnable === 'new'
      const values = { [enableKey]: encryptEnable }
      if (encryptEnable === 'new') {
        values[algKey] = draft.encrypt_key_alg || ''
      }
      if (encryptEnable === 'existing') {
        // options 未到：等下次重试；到了但未命中：不回填非法 key，保证可用
        if (draft.encrypt_key_id) {
          if (!this.encryptKeyOptions.length) return false
          if (this.encryptKeyOptions.some(o => o.value === draft.encrypt_key_id)) {
            values[idKey] = draft.encrypt_key_id
          }
        }
      }
      if (!encryptEnable) {
        values[algKey] = undefined
        values[idKey] = undefined
      }
      this.form.fc.setFieldsValue(values)
      if (this.form.fd) {
        Object.keys(values).forEach((k) => {
          if (values[k] === undefined) this.$delete(this.form.fd, k)
          else this.$set(this.form.fd, k, values[k])
        })
      }
      return true
    },
    change (val) {
      const v = val && val.target ? val.target.value : val
      if (v === 'existing') {
        this.showKeys = true
        this.showAlgs = false
      } else if (v === 'new') {
        this.showKeys = false
        this.showAlgs = true
      } else {
        this.showKeys = false
        this.showAlgs = false
        // 关闭加密：清掉子字段，避免阴阳表单
        const algKey = this.fieldName(this.decorators.encrypt_key_alg)
        const idKey = this.fieldName(this.decorators.encrypt_key_id)
        if (this.form && this.form.fc) {
          this.form.fc.setFieldsValue({ [algKey]: undefined, [idKey]: undefined })
        }
        if (this.form && this.form.fd) {
          this.$delete(this.form.fd, algKey)
          this.$delete(this.form.fd, idKey)
        }
      }
      if (!this._encryptDraftRestoring) {
        this.$nextTick(() => this.persistFormFieldDraftSnapshot())
      }
    },
    onEncryptFieldChange () {
      if (this._encryptDraftRestoring) return
      this.$nextTick(() => this.persistFormFieldDraftSnapshot())
    },
    async fetchEncryptKeyOptions () {
      const credManager = new this.$Manager('credentials', 'v1')
      const result = await credManager.rpc({ methodname: 'GetEncryptKeysRpc' })
      const opts = []
      for (let i = 0; i < result.data.length; i++) {
        const value = result.data[i].key_id
        const text = result.data[i].key_name + ' (' + result.data[i].key_id + ',' + result.data[i].alg.toUpperCase() + ')'
        opts.push({ value: value, text: text })
      }
      this.encryptKeyOptions = opts
      // options 就绪后补一次草稿回填
      if (this.canRestoreFormFieldDraft()) {
        const draft = this.readFormFieldDraft()
        if (draft && draft.encryptEnable === 'existing') {
          this.tryApplyEncryptDraft(draft)
        }
      }
    },
  },
}
</script>
