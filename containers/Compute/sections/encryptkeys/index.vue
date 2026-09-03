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
      <a-radio-group v-decorator="decorators.encrypt_key_alg">
        <a-radio-button value="">{{ $t('compute.text_1') }}</a-radio-button>
        <a-radio-button value="aes-256">AES256</a-radio-button>
        <!--a-radio-button value="sm4">SM4</a-radio-button-->
      </a-radio-group>
    </a-form-item>
    <a-form-item v-if="showKeys">
      <a-select v-decorator="decorators.encrypt_key_id" :placeholder="$t('compute.prompt.encrypt_key')">
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
    /** selection：radio/单选 select/switch 类，local + session 双写、可跨 tab 回填 */
    formDraftKind: {
      type: String,
      default: 'selection',
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
  watch: {
    encryptKeyOptions: {
      immediate: true,
      handler () {
        this.$nextTick(() => {
          // 跨 tab：仅当用户已切到 existing 时补密钥；同 tab 走完整回填
          if (this.isFormFieldDraftFromLocal()) {
            this.tryRestoreEncryptSubFields(this.getCurrentEncryptEnable())
            return
          }
          this.restoreFormFieldDraftFields()
        })
      },
    },
  },
  created () {
    this.fetchEncryptKeyOptions()
  },
  methods: {
    fieldName (dec) {
      return Array.isArray(dec) ? dec[0] : dec
    },
    getCurrentEncryptEnable () {
      const fc = this.resolveFormFc()
      if (!fc) return ''
      return fc.getFieldValue(this.fieldName(this.decorators.encryptEnable)) || ''
    },
    getCreateFormFieldDraftSnapshot () {
      const fc = this.resolveFormFc()
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
    applyCreateFormFieldDraft (draft) {
      if (!draft || !this.resolveFormFc()) return
      // 跨 tab：不自动回填类型；用户切换类型后再回填子选项
      if (this.isFormFieldDraftFromLocal()) return
      this.tryApplyEncryptDraft(draft)
    },
    /**
     * 同 tab：完整回填类型 + 子选项
     */
    tryApplyEncryptDraft (draft) {
      if (!draft || !this.resolveFormFc()) return false
      const encryptEnable = draft.encryptEnable || ''
      this.showKeys = encryptEnable === 'existing'
      this.showAlgs = encryptEnable === 'new'
      const enableKey = this.fieldName(this.decorators.encryptEnable)
      const values = { [enableKey]: encryptEnable }
      this.applyFormFieldValues(values)
      this.$nextTick(() => this.applyEncryptSubFields(draft, encryptEnable))
      return true
    },
    /**
     * 用户已选中的类型与草稿一致时，回填算法 / 密钥
     * @returns {boolean} existing 且 options 未就绪时返回 false，便于列表到了再试
     */
    tryRestoreEncryptSubFields (encryptEnable) {
      if (!this.canRestoreFormFieldDraft() || !encryptEnable) return true
      const draft = this.readFormFieldDraft()
      if (!draft || draft.encryptEnable !== encryptEnable) return true
      return this.applyEncryptSubFields(draft, encryptEnable)
    },
    applyEncryptSubFields (draft, encryptEnable) {
      const fc = this.resolveFormFc()
      if (!fc || !draft) return true
      const algKey = this.fieldName(this.decorators.encrypt_key_alg)
      const idKey = this.fieldName(this.decorators.encrypt_key_id)
      if (encryptEnable === 'new') {
        const alg = draft.encrypt_key_alg != null ? draft.encrypt_key_alg : ''
        this.applyFormFieldValues({ [algKey]: alg })
        return true
      }
      if (encryptEnable === 'existing') {
        if (!draft.encrypt_key_id) return true
        if (!this.encryptKeyOptions.length) return false
        if (!this.encryptKeyOptions.some(o => o.value === draft.encrypt_key_id)) return true
        this.applyFormFieldValues({ [idKey]: draft.encrypt_key_id })
        return true
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
        this.applyFormFieldValues({ [algKey]: undefined, [idKey]: undefined })
        if (this.form && this.form.fd) {
          this.$delete(this.form.fd, algKey)
          this.$delete(this.form.fd, idKey)
        }
      }
      // 跨 tab / 同 tab：用户切到草稿同类型时再回填子选项
      this.$nextTick(() => this.tryRestoreEncryptSubFields(v))
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
    },
  },
}
</script>
