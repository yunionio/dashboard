<template>
  <div>
    <template v-if="accountLoaded">
      <a-row :gutter="8" class="w-100">
        <template v-if="isAdminMode">
          <a-col :span="8">
            <a-select v-model="domain" show-search @search="getConditionDomains" allow-clear>
              <template v-for="item of domains">
                <a-select-option :key="item.id" :value="item.id">
                  <span class="text-color-secondary">{{ $t('dictionary.domain') }}: </span>{{ item.name }}
                </a-select-option>
              </template>
            </a-select>
          </a-col>
        </template>
        <a-col :span="isAdminMode ? 8 : 12">
          <a-select v-model="project" show-search @search="fetchProjects" allow-clear>
            <template v-for="item of projects">
              <a-select-option :key="item.id" :value="item.id">
                <span class="text-color-secondary">{{ $t('dictionary.project') }}: </span>{{ item.name }}
              </a-select-option>
            </template>
          </a-select>
        </a-col>
        <a-col :span="isAdminMode ? 8 : 12">
          <a-select v-model="user" show-search @search="fetchUsers" allow-clear>
            <template v-for="item of users">
              <a-select-option :key="item.id" :value="item.id">
                <span class="text-color-secondary">{{ $t('dictionary.user') }}: </span>{{ item.name }}
              </a-select-option>
            </template>
          </a-select>
        </a-col>
      </a-row>
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
  name: 'UserSelect',
  props: {
    cloudproviderId: String,
    cloudaccountId: String,
    defaultProjectId: String,
    defaultDomainId: String,
    defaultUserId: String,
    defaultDomainName: String,
  },
  data () {
    return {
      cloudaccount: {},
      accountLoaded: false,
      domainLoading: false,
      domains: [],
      domain: '',
      domainObj: {},
      projects: [],
      projectLoading: false,
      project: '',
      projectObj: {},
      userLoading: false,
      users: [],
      user: '',
      userObj: {},
      defaultProject: {},
      defaultDomain: {},
      defaultUser: {},
      // defaultUserJoinProjects: [],
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
          this.fetchProjects()
        } else {
          this.projects = []
          this.project = ''
          this.projectObj = {}
          this.$emit('update:project', this.projectObj)
        }
      }
    },
    project (val, oldVal) {
      if (val !== oldVal) {
        if (val) {
          const obj = R.find(R.propEq('id', val))(this.projects)
          this.$emit('update:project', obj)
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
    cloudproviderId (val) {
      this.getConditionDomains()
    },
  },
  destroyed () {
    this.cm = null
    this.dm = null
    this.um = null
    this.pm = null
    this.cpm = null
  },
  async created () {
    this.cm = new this.$Manager('cloudaccounts')
    this.dm = new this.$Manager('domains', 'v1')
    this.um = new this.$Manager('users', 'v1')
    this.pm = new this.$Manager('projects', 'v1')
    this.cpm = new this.$Manager('cloudproviders')
    await this.getAccount()
    if (this.isAdminMode && this.defaultDomainId) {
      await this.getDefaultDomain()
    }
    if (this.defaultProjectId) {
      await this.getDefaultProject()
    }
    if (this.defaultUserId) {
      await this.getDefaultUser()
    }
    await this.getConditionDomains()
  },
  methods: {
    async getAccount () {
      try {
        const cloudaccountRes = await this.cm.get({
          id: this.cloudaccountId,
          params: {
            scope: this.$store.getters.scope,
          },
        })
        this.cloudaccount = cloudaccountRes.data || {}
        this.accountLoaded = true
      } catch (error) {
        throw error
      }
    },
    async getProvider () {
      try {
        const response = await this.cpm.get({
          id: this.cloudproviderId,
        })
        return response.data || {}
      } catch (error) {
        throw error
      }
    },
    async getDefaultDomain () {
      try {
        const response = await this.dm.get({
          id: this.defaultDomainId,
          params: {
            scope: this.$store.getters.scope,
          },
        })
        this.defaultDomain = response.data || {}
      } catch (error) {
        throw error
      }
    },
    async getDefaultProject () {
      try {
        const response = await this.pm.get({
          id: this.defaultProjectId,
          params: {
            scope: this.$store.getters.scope,
          },
        })
        this.defaultProject = response.data || {}
      } catch (error) {
        throw error
      }
    },
    async getDefaultUser () {
      try {
        const response = await this.um.get({
          id: this.defaultUserId,
          params: {
            scope: this.$store.getters.scope,
          },
        })
        this.defaultUser = response.data || {}
      } catch (error) {
        throw error
      }
    },
    async getConditionDomains (query) {
      if (!this.isAdminMode) {
        const domains = [
          this.userInfo.domain,
        ]
        this.domains = domains
        this.domain = this.domains[0].id
        this.domainObj = this.domains[0]
        return
      }
      this.domainLoading = true
      const isGoogle = this.cloudaccount.provider === 'Google'
      // const isOwner = this.isAdminMode || this.cloudaccount.domain_id === this.$store.getters.userInfo.projectDomainId
      const { public_scope, shared_domains, share_mode } = this.cloudaccount
      // const userDomain = {
      //   id: this.userInfo.projectDomainId,
      //   name: this.userInfo.projectDomain,
      // }
      const accountDomain = {
        id: this.cloudaccount.domain_id,
        name: this.cloudaccount.project_domain,
      }
      let domains = []
      if (public_scope === 'none') {
        domains = [accountDomain]
      }
      if (public_scope === 'domain') {
        if (share_mode === 'provider_domain') {
          if (isGoogle) {
            if (this.cloudproviderId) {
              const provider = await this.getProvider()
              domains = [{
                id: provider.domain_id,
                name: provider.project_domain,
              }]
            }
          } else {
            domains = [accountDomain]
          }
        } else {
          domains = shared_domains
          const hasAccountDomain = R.find(R.propEq('id', accountDomain.id))(domains)
          if (!hasAccountDomain) {
            domains.push(accountDomain)
          }
        }
      }
      if (public_scope === 'system') {
        if (share_mode === 'provider_domain') {
          if (isGoogle) {
            if (this.cloudproviderId) {
              const provider = await this.getProvider()
              domains = [{
                id: provider.domain_id,
                name: provider.project_domain,
              }]
            }
          } else {
            domains = [accountDomain]
          }
        } else {
          try {
            const params = {
              scope: this.scope,
              limit: 20,
            }
            if (query) {
              params.filter = `name.contains(${query})`
            }
            try {
              const response = await this.dm.list({
                params,
              })
              const data = response.data.data || []
              domains = data
            } catch (error) {
              throw error
            }
          } catch (error) {
            throw error
          }
        }
      }
      if (!R.isEmpty(this.defaultDomain)) {
        const isFind = R.find(R.propEq('id', this.defaultDomain.id))(domains)
        if (!isFind) {
          domains.push(this.defaultDomain)
        }
      }
      if (query) {
        domains = domains.filter(item => item.name.includes(query))
      }
      this.domainLoading = false
      this.domains = domains
      if (!R.isEmpty(this.defaultDomain) && R.find(R.propEq('id', this.defaultDomain.id))(this.domains)) {
        this.domain = this.defaultDomain.id
        this.domainObj = { ...this.defaultDomain }
      } else if (this.domains.length) {
        this.domain = this.domains[0].id
        this.domainObj = this.domains[0]
      } else {
        this.domain = ''
        this.domainObj = {}
      }
    },
    // 获取项目列表
    async fetchProjects (query) {
      const params = {
        scope: this.scope,
        domain_id: this.domain,
        limit: 20,
      }
      if (query) {
        params.filter = `name.contains(${query})`
      }
      try {
        const response = await this.pm.list({
          params,
        })
        const data = response.data.data || []
        this.projects = data
        if (
          !R.isEmpty(this.defaultDomain) &&
          !R.isEmpty(this.defaultProject) &&
          this.defaultProject.domain_id === this.defaultDomain.id
        ) {
          const isFind = R.find(R.propEq('id', this.defaultProject.id))(this.projects)
          if (!isFind) {
            if (!query || (query && this.defaultProject.name.includes(query))) {
              this.projects.push(this.defaultProject)
            }
          }
        }
        if (!R.isEmpty(this.defaultProject) && R.find(R.propEq('id', this.defaultProject.id))(this.projects)) {
          this.project = this.defaultProject.id
          this.projectObj = { ...this.defaultProject }
        } else if (this.projects.length > 0) {
          this.project = this.projects[0].id
          this.projectObj = this.projects[0]
        } else {
          this.project = ''
          this.projectObj = {}
        }
      } catch (error) {
        throw error
      }
    },
    // 获取可用的user list
    async fetchUsers (query) {
      const params = {
        scope: this.scope,
        project: this.project,
      }
      if (query) {
        params.filter = `name.contains(${query})`
      }
      try {
        const response = await this.um.list({
          params,
        })
        const data = response.data.data || []
        this.users = data
        if (!R.isEmpty(this.defaultUser) && R.find(R.propEq('id', this.defaultUser.id))(this.users)) {
          this.user = this.defaultUser.id
          this.userObj = { ...this.defaultUser }
        } else if (this.users.length > 0) {
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
