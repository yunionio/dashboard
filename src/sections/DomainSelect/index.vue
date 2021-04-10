<template>
  <div>
    <template v-if="loaded">
      <a-select
        :value="value"
        :loading="loading"
        :placeholder="$t('rules.domain')"
        :filterOption="false"
        show-search
        @search="fetchDomains"
        @change="handleChange">
        <a-select-option v-for="item of domains" :value="item.id" :key="item.id">{{ item.name }}</a-select-option>
      </a-select>
    </template>
    <template v-else>
      <a-spin />
    </template>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'

export default {
  name: 'DomainSelect',
  props: {
    value: String,
    label: String,
    params: Object,
  },
  data () {
    return {
      loaded: false,
      domains: [],
    }
  },
  computed: {
    ...mapGetters(['scope', 'userInfo']),
    userDomain () {
      return {
        id: this.userInfo.projectDomainId,
        name: this.userInfo.projectDomain,
      }
    },
  },
  beforeDestroy () {
    this.dm = null
  },
  created () {
    this.dm = new this.$Manager('domains', 'v1')
    this.fetchDomains()
  },
  methods: {
    async fetchDomains (query) {
      this.loading = true
      const params = {
        scope: this.scope,
        limit: 20,
        ...this.params,
      }
      if (query) {
        params.search = query
      }
      try {
        const response = await this.dm.list({
          params,
        })
        const data = response.data.data || []
        const userDomain = R.find(R.propEq('id', this.userDomain.id))(data)
        if (!userDomain) {
          data.push(this.userDomain)
        }
        this.domains = data
      } catch (error) {
        throw error
      } finally {
        this.loading = false
        this.loaded = true
      }
    },
    handleChange (val) {
      this.$emit('change', val)
      this.$emit('input', val)
    },
  },
}
</script>
