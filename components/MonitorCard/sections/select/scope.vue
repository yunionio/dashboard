<template>
  <div>
    <a-row>
      <a-col :span="8">
        <a-radio-group v-model="select.scope" @change="onChange">
          <a-radio-button v-for="o of scopeOptions" :value="o.value" :key="o.key">
            {{ o.label }}
          </a-radio-button>
        </a-radio-group>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="16">
        <a-select
            v-model="select.id"
            dropdownClassName="oc-select-dropdown"
            show-search
            v-if="showSelect"
            @search="handleSearch"
            @change="handleSelectChange"
            :filterOption="false"
            :loading="loading">
          <template v-for="option of options">
            <a-select-option :key="option.id" :value="option.id">
              <span class="text-color-secondary option-prefix">{{ $t(`dictionary.${select.scope}`) }}: </span>{{ option.name }}
            </a-select-option>
          </template>
        </a-select>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'ScopeSelect',
  props: {
    value: {
      type: Object,
      default: () => ({ scope: '', id: '' }),
    },
  },
  data () {
    const scope = this.$store.getters.scope
    let scopeId = ''
    if (scope === 'domain') {
      scopeId = this.$store.getters.userInfo.projectDomainId
    } else if (scope === 'project') {
      scopeId = this.$store.getters.userInfo.projectId
    }

    this.fetchOptions = _.debounce(this.fetchOptions, 300)
    return {
      scope: scope,
      select: { scope: scope, id: scopeId },
      options: [],
    }
  },
  computed: {
    scopeLevel () {
      if (this.scope === 'system') return 2
      if (this.scope === 'domain') return 1
      return 0
    },
    scopeOptions () {
      const options = []
      if (this.scopeLevel >= 2) options.push({ value: 'system', key: 'system', label: this.$t('shareScope.system') })
      if (this.scopeLevel >= 1) options.push({ value: 'domain', key: 'domain_id', label: this.$t('shareScope.domain') })
      if (this.scopeLevel >= 0) options.push({ value: 'project', key: 'project_id', label: this.$t('shareScope.project') })
      return options
    },
    showSelect () {
      return this.select.scope !== this.scope
    },
    manager () {
      const selectedScope = this.select.scope
      if (selectedScope === 'domain') return new this.$Manager('domains', 'v1')
      if (selectedScope === 'project') return new this.$Manager('projects', 'v1')
      return undefined
    },
  },
  methods: {
    onChange (v) {
      this.select.id = ''
      this.fetchOptions()
    },
    handleSearch (v) {
      this.fetchOptions(v)
    },
    handleSelectChange (v) {
      this.select.id = v
      this.$emit('change', this.select)
    },
    async _fetchOptions (params) {
      if (this.showSelect && this.manager) {
        const { data: { data } } = await this.manager.list({ params: params })
        return data.map((item) => { return { id: item.id, name: item.name } })
      }
      return []
    },
    async fetchOptions (search) {
      this.loading = true
      try {
        const params = {
          scope: this.scope,
          limit: 50,
        }
        if (search && search.length > 0) {
          params['filter.0'] = `name.contains(${search})`
        }
        this.options = await this._fetchOptions(params)
        if (this.options[0]) {
          this.select.id = this.options[0].id
          this.$emit('change', this.select)
        }
        this.loading = false
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>

</style>
