<template>
  <a-select
    :disabled="disabled"
    @change="change"
    placeholder="请选择命名空间"
    :value="value">
    <a-select-option
      v-for="item in options"
      :value="item.name"
      :key="item.name">
      {{ item.label || item.name }}
    </a-select-option>
  </a-select>
</template>

<script>
export default {
  name: 'K8sComponentsNamespace',
  props: {
    value: { // String
    },
    supportAllNamespace: {
      type: Boolean,
      default: false,
    },
    setDefault: { // 设置默认
      type: Boolean,
      default: true,
    },
    cluster: {
      type: String,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      options: [],
    }
  },
  watch: {
    cluster (v) {
      if (v) this._fetchNamespace()
    },
  },
  created () {
    this._fetchNamespace()
  },
  methods: {
    change (v) {
      this.$emit('input', v)
      this.$emit('change', v)
      if (v) {
        const obj = this.options.find(val => val.name === v)
        this.$emit('update:namespaceObj', obj)
      } else {
        this.$emit('update:namespaceObj', {})
      }
    },
    _fetchNamespace () {
      const namespacesM = new this.$Manager('namespaces', 'v1')
      const params = {
        cluster: this.cluster,
        limit: 0,
        scope: this.$store.getters.scope,
      }
      if (!this.$store.getters.isAdminMode) {
        params.project = this.$store.getters.userInfo.projectId
      }
      if (!params.cluster) return
      namespacesM.list({ params }).then(({ data: { data = [] } }) => {
        if (this.supportAllNamespace) {
          this.options = data.concat({ name: 'all_namespace', label: '所有命名空间' })
        } else {
          this.options = data.map(val => ({ ...val, label: val.name }))
        }
        const isErrorNamespace = !this.options.find(v => v.name === this.value)
        if (this.setDefault && isErrorNamespace) {
          this.setDefaultNamespace(this.options)
        }
      })
    },
    setDefaultNamespace (opts) {
      const all = opts.find(v => v.name === 'all_namespace')
      if (opts && opts.length) {
        if (all) {
          this.namespace = all.name
        } else {
          this.namespace = opts[0].name
        }
        this.change(this.namespace)
      } else {
        this.change(undefined)
      }
    },
  },
}
</script>
