<template>
  <a-row :gutter="8" class="w-100">
    <a-col :span="12">
      <a-select v-model="domain" allow-clear>
        <template v-for="item of domains">
          <a-select-option :key="item.id" :value="item.id">
            <span class="text-color-secondary">{{ $t('dictionary.domain') }}: </span>{{ item.name }}
          </a-select-option>
        </template>
      </a-select>
    </a-col>
    <a-col :span="12">
      <a-select v-model="user" allow-clear>
        <template v-for="item of users">
          <a-select-option :key="item.id" :value="item.id">
            <span class="text-color-secondary">{{ $t('dictionary.user') }}: </span>{{ item.name }}
          </a-select-option>
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
        if (val) {
          const obj = R.find(R.propEq('id', val))(this.domains)
          this.$emit('update:domain', obj)
          this.fetchUsers()
        } else {
          this.users = []
          this.user = ''
          this.userObj = {}
          this.$emit('input', this.user)
          this.$emit('change', this.user)
          this.$emit('update:user', this.userObj)
        }
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
    this.dm = null
    this.um = null
  },
  created () {
    this.cm = new this.$Manager('cloudaccounts')
    this.dm = new this.$Manager('domains', 'v1')
    this.um = new this.$Manager('users', 'v1')
    this.getCanUseDomains()
  },
  methods: {
    async getCanUseDomains (query) {
      this.domainLoading = true
      try {
        const cloudaccountRes = await this.cm.get({
          id: this.cloudaccountId,
          params: {
            scope: this.$store.getters.scope,
          },
        })
        const cloudaccount = cloudaccountRes.data || {}
        const isOwner = this.isAdminMode || cloudaccount.domain_id === this.$store.getters.userInfo.projectDomainId
        const userDomain = {
          id: this.userInfo.projectDomainId,
          name: this.userInfo.projectDomain,
        }
        if (this.isAdminMode) {
          const data = await this.fetchDomains(query)
          this.domains = data
          const hasUserDomain = R.find(R.propEq('id', userDomain.id))(this.domains)
          if (!hasUserDomain) {
            this.domains.push(userDomain)
          }
        } else {
          if (isOwner) {
            this.domains = [userDomain]
          }
        }
        if (this.domains.length > 0) {
          this.domain = this.domains[0].id
          this.domainObj = this.domains[0]
        }
      } finally {
        this.domainLoading = false
      }
    },
    // async getCanUseDomains (query) {
    //   this.domainLoading = true
    //   try {
    //     // 获取云账号信息
    //     const cloudaccountRes = await this.cm.get({
    //       id: this.cloudaccountId,
    //       params: {
    //         scope: this.$store.getters.scope,
    //       },
    //     })
    //     const cloudaccount = cloudaccountRes.data || {}
    //     // 如果云账号未共享，直接返回云账号的所属域
    //     if (!cloudaccount.is_public) {
    //       this.domains = [{
    //         id: cloudaccount.domain_id,
    //         name: cloudaccount.project_domain,
    //       }]
    //     } else {
    //       // 共享时
    //       // 管理员，显示可用域
    //       const isOwner = this.isAdminMode || cloudaccount.domain_id === this.$store.getters.userInfo.projectDomainId
    //       const userDomain = {
    //         id: this.userInfo.projectDomainId,
    //         name: this.userInfo.projectDomain,
    //       }
    //       if (this.isAdminMode) {
    //         // 如果是google云账号，显示所有域
    //         if (cloudaccount.brand === 'Google') {
    //           const data = await this.fetchDomains(query)
    //           this.domains = data
    //         } else {
    //           if (cloudaccount.shared_domains && cloudaccount.shared_domains.length > 0) {
    //             this.domains = cloudaccount.shared_domains
    //           } else {
    //             const data = await this.fetchDomains(query)
    //             this.domains = data
    //           }
    //         }
    //         const hasUserDomain = R.find(R.propEq('id', userDomain.id))(this.domains)
    //         if (!hasUserDomain) {
    //           this.domains.push(userDomain)
    //         }
    //       } else {
    //         if (isOwner) {
    //           this.domains = [userDomain]
    //         }
    //       }
    //     }
    //     if (this.domains.length > 0) {
    //       this.domain = this.domains[0].id
    //       this.domainObj = this.domains[0]
    //     }
    //   } finally {
    //     this.domainLoading = false
    //   }
    // },
    // 获取域列表
    async fetchDomains (query) {
      const params = {
        scope: this.scope,
        limit: 20,
      }
      if (query) {
        params.search = query
      }
      try {
        const response = await this.dm.list({
          params,
        })
        const data = response.data.data || []
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
        // if (!R.isNil(this.defaultUser) && !R.isEmpty(this.defaultUser)) {
        //   const hasDefaultUser = R.find(R.propEq('id', this.defaultUser.id))(data)
        //   if (!hasDefaultUser) {
        //     data.unshift(this.defaultUser)
        //   }
        // }
        this.users = data
        if (this.users.length > 0) {
          this.user = this.users[0].id
          this.userObj = this.users[0]
        } else {
          this.user = ''
          this.userObj = {}
        }
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
