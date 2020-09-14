<template>
  <a-select
    show-search
    :disabled="disabled"
    @change="change"
    :placeholder="$t('k8s.text_61')"
    style="min-width: 200px;"
    :filter-option="filterOption"
    option-filter-prop="children"
    :loading="loading"
    :value="value">
    <a-select-option v-for="item in options" :value="item.id" :key="item.id">
      <div class="d-flex">
        <span class="text-truncate flex-fill mr-2">{{ item.label || item.name }}</span>
        <span style="color: #8492a6; font-size: 13px" v-if="R.is(Number, item.num)">{{ item.num }}</span>
      </div>
    </a-select-option>
  </a-select>
</template>

<script>
import * as R from 'ramda'

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
    namespaceMap: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      options: [],
      R,
      loading: false,
    }
  },
  watch: {
    cluster (v) {
      if (v) this._fetchNamespace()
    },
    namespaceMap () {
      this.$nextTick(this.addNum)
    },
  },
  created () {
    this._fetchNamespace()
  },
  methods: {
    addNum () {
      if (R.isNil(this.namespaceMap)) return
      this.options = this.options.map(val => {
        const item = R.clone(val)
        if (R.is(Array, this.namespaceMap[item.id])) {
          item.num = this.namespaceMap[item.id].length
        } else {
          if (item.id !== 'all_namespace') {
            item.num = 0
          }
        }
        return item
      })
    },
    change (v) {
      this.$emit('input', v)
      this.$emit('change', v)
      if (v) {
        const obj = this.options.find(val => val.id === v)
        this.$emit('update:namespaceObj', obj)
      } else {
        this.$emit('update:namespaceObj', {})
      }
    },
    async _fetchNamespace () {
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
      try {
        this.loading = true
        const { data: { data = [] } } = await namespacesM.list({ params })
        this.options = data.map(val => ({ ...val, label: val.name }))
        this.loading = false
        if (this.supportAllNamespace) {
          this.options = data.concat({ id: 'all_namespace', label: this.$t('k8s.text_379') })
        }
        const isErrorNamespace = !this.options.find(v => v.id === this.value)
        const isEmptyNamespace = R.isEmpty(this.value) || R.isNil(this.value)
        if (this.setDefault && (isEmptyNamespace || isErrorNamespace)) {
          this.setDefaultNamespace(this.options)
        } else if (this.setDefault && !isEmptyNamespace && !isErrorNamespace) {
          this.change(this.value)
        }
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    setDefaultNamespace (opts) {
      const all = opts.find(v => v.id === 'all_namespace')
      if (opts && opts.length) {
        if (all) {
          this.namespace = all.id
        } else {
          this.namespace = opts[0].id
        }
        this.change(this.namespace)
      } else {
        this.change(undefined)
      }
    },
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
  },
}
</script>
