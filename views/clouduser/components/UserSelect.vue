<template>
  <a-row :gutter="8" class="w-100">
    <a-col :span="12">
      <a-select v-model="domain">
        <template v-for="item of domains">
          <a-select-option :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
        </template>
      </a-select>
    </a-col>
    <a-col :span="12">
      <a-select v-model="user">
        <template v-for="item of users">
          <a-select-option :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
        </template>
      </a-select>
    </a-col>
  </a-row>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'

export default {
  name: 'UserSelect',
  props: {
    cloudaccountId: String,
    defaultUser: Object,
    defaultDomain: Object,
  },
  data () {
    return {
      domainLoading: false,
      domains: [],
      domain: '',
      domainObj: {},
      userLoading: false,
      users: [],
      user: '',
      userObj: {},
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'userInfo', 'scope']),
  },
  watch: {
    domain (val, oldVal) {
      if (val !== oldVal) {
        const obj = R.find(R.propEq('id', val))(this.domains)
        this.$emit('update:domain', obj)
        this.fetchUsers()
      }
    },
    user (val, oldVal) {
      this.$emit('input', val)
      this.$emit('change', val)
      const obj = R.find(R.propEq('id', val))(this.users)
      this.$emit('update:user', obj)
    },
  },
  destroyed () {
    this.cm = null
    this.um = null
  },
  created () {
    this.cm = new this.$Manager('cloudaccounts')
    this.um = new this.$Manager('users', 'v1')
    this.getCanUseDomains()
  },
  methods: {
    async getCanUseDomains (query) {
      this.domainLoading = true
      const userDomain = {
        id: this.userInfo.projectDomainId,
        name: this.userInfo.projectDomain,
      }
      if (!this.isAdminMode) {
        this.domains = [userDomain]
        return
      }
      try {
        const data = await this.fetchCandidateDomains(query)
        const hasUserDomain = R.find(R.propEq('id', userDomain.id))(data)
        if (!hasUserDomain) {
          data.push(userDomain)
        }
        if (!R.isNil(this.defaultDomain) && !R.isEmpty(this.defaultDomain)) {
          const hasDefaultDomain = R.find(R.propEq('id', this.defaultDomain.id))(data)
          if (!hasDefaultDomain) {
            data.unshift(this.defaultDomain)
          }
        }
        this.domains = data
        if (this.domains.length > 0) {
          this.domain = this.domains[0].id
          this.domainObj = this.domains[0]
        }
      } catch (error) {
        throw error
      }
    },
    // 获取可用的domain list
    async fetchCandidateDomains (query) {
      const params = {
        scope: this.scope,
      }
      if (query) {
        params.search = query
      }
      try {
        const response = await this.cm.getSpecific({
          id: this.cloudaccountId,
          spec: 'change-owner-candidate-domains',
          params,
        })
        const data = response.data.candidates || []
        return data
      } catch (error) {
        throw error
      }
    },
    // 获取可用的user list
    async fetchUsers (query) {
      const params = {
        scope: this.scope,
        domain_id: this.domain,
      }
      if (query) {
        params.search = query
      }
      try {
        const response = await this.um.list({
          params,
        })
        const data = response.data.data || []
        if (!R.isNil(this.defaultUser) && !R.isEmpty(this.defaultUser)) {
          const hasDefaultUser = R.find(R.propEq('id', this.defaultUser.id))(data)
          if (!hasDefaultUser) {
            data.unshift(this.defaultUser)
          }
        }
        this.users = data
        if (this.users.length > 0) {
          this.user = this.users[0].id
          this.userObj = this.users[0]
        }
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
