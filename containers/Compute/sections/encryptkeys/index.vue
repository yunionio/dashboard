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
        <a-radio-button value="sm4">SM4</a-radio-button>
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
export default {
  name: 'EncryptKeys',
  props: {
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
  computed: {
  },
  created () {
    this.fetchEncryptKeyOptions()
  },
  methods: {
    change (val) {
      if (val.target.value === 'existing') {
        this.showKeys = true
        this.showAlgs = false
      } else if (val.target.value === 'new') {
        this.showKeys = false
        this.showAlgs = true
      } else {
        this.showKeys = false
        this.showAlgs = false
      }
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
