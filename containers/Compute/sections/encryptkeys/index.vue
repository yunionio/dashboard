<template>
  <div>
    <a-form-item class="mb-0">
      <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.encryptEnable" @change="change" />
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
        if (val.encryptEnable && !val.encrypt_key_id) {
          return false
        }
        return true
      },
    },
  },
  data () {
    return {
      showKeys: this.decorators.encryptEnable[1].initialValue,
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
      this.showKeys = val
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
