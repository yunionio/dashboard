<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('common_100')}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :name="params.name || $t('common_92')" :action="$t('common_100')" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form-model
        ref="form"
        :model="fd"
        :rules="rules"
        v-bind="formItemLayout">
        <a-form-model-item :label="$t('common_101')" prop="type">
          <a-radio-group v-model="fd.type" @change="handleTypeChange">
            <template v-for="item of typeOptions">
              <a-radio-button :key="item.key" :value="item.key">{{ item.label }}</a-radio-button>
            </template>
          </a-radio-group>
        </a-form-model-item>
        <!-- 项目选择 -->
        <template v-if="shareProjectMode">
          <a-form-model-item :label="$t('dictionary.project')" prop="shared_projects">
            <template v-if="projectLoaded">
              <a-select
                v-model="fd.shared_projects"
                mode="multiple"
                :filterOption="false"
                @search="fetchProjects"
                @select="val => handleHasAllSelect(val, 'shared_projects')"
                @deselect="val => handleDeselect(val, 'shared_projects')"
                :placeholder="$t('rules.project')">
                <template v-for="item of projects">
                  <a-select-option :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
                </template>
              </a-select>
            </template>
            <template v-else>
              <a-spin />
            </template>
          </a-form-model-item>
        </template>
        <!-- 域选择 -->
        <template v-if="shareDomainMode">
          <a-form-model-item :label="$t('dictionary.domain')" prop="shared_domains">
            <template v-if="domainLoaded">
              <a-select
                v-model="fd.shared_domains"
                mode="multiple"
                :filterOption="false"
                @search="fetchDomains"
                @select="val => handleHasAllSelect(val, 'shared_domains')"
                @deselect="val => handleDeselect(val, 'shared_domains')"
                :placeholder="$t('rules.domain')">
                <template v-for="item of domains">
                  <a-select-option :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
                </template>
              </a-select>
            </template>
            <template v-else>
              <a-spin />
            </template>
          </a-form-model-item>
        </template>
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'SetPublicDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const isBatch = this.params.data.length >= 2
    const { scope: resScope } = this.params
    let typeInitialValue = 'none'
    let sharedDomainsInitialValue = []
    let sharedProjectsInitialValue = []
    // 只有单项操作时，才进行反显
    if (!isBatch && this.params.data[0].is_public) {
      const firstData = this.params.data[0]
      const { public_scope: publicScope, shared_domains: sharedDomains, shared_projects: sharedProjects } = firstData
      // 初始化值
      // 当为部门共享时
      if (publicScope === 'system' && this.$store.getters.isAdminMode) {
        if (this.$store.getters.l3PermissionEnable) {
          typeInitialValue = 'domain'
          // 域为空时，为全局共享
          if (R.isNil(sharedDomains) || R.isEmpty(sharedDomains)) {
            sharedDomainsInitialValue = ['all']
          } else {
            sharedDomainsInitialValue = sharedDomains.map(item => item.id)
          }
        } else {
          typeInitialValue = 'project'
          // 域为空时，为全局共享
          if (R.isNil(sharedProjects) || R.isEmpty(sharedProjects)) {
            sharedProjectsInitialValue = ['all']
          } else {
            sharedProjectsInitialValue = sharedProjects.map(item => item.id)
          }
        }
      }
      // 为域共享时
      if (publicScope === 'domain') {
        typeInitialValue = 'domain'
        // 2020.6.24修改 start
        // 未开启三级权限直接定位至不共享
        if (!this.$store.getters.l3PermissionEnable) {
          typeInitialValue = 'none'
        }
        // 2020.6.24修改 end
        if (R.isNil(sharedDomains) || R.isEmpty(sharedDomains)) {
          typeInitialValue = 'project'
          sharedProjectsInitialValue = ['all']
        } else {
          sharedDomainsInitialValue = sharedDomains.map(item => item.id)
        }
      }
      // 为项目共享时
      if (publicScope === 'project') {
        typeInitialValue = 'project'
        if (R.isNil(sharedProjects) || R.isEmpty(sharedProjects)) {
          sharedProjectsInitialValue = ['all']
        } else {
          sharedProjectsInitialValue = sharedProjects.map(item => item.id)
        }
      }
    }
    return {
      loading: false,
      fd: {
        type: typeInitialValue,
        shared_domains: sharedDomainsInitialValue,
        shared_projects: sharedProjectsInitialValue,
      },
      rules: {
        type: [
          { required: true, message: this.$t('common_102') },
        ],
        shared_domains: [
          { required: true, message: this.$t('rules.domain') },
        ],
        shared_projects: [
          { required: true, message: this.$t('rules.project') },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      domainLoaded: false,
      domains: [],
      projectLoaded: false,
      projects: [],
      // 是否为批量操作
      isBatch,
      resScope,
    }
  },
  computed: {
    ...mapGetters(['scope', 'l3PermissionEnable', 'isAdminMode']),
    columns () {
      if (this.params.columns && this.params.columns.length >= 2) {
        const keys = ['name', 'public_scope', 'shared_domains', 'tenant', 'project_domain']
        return this.params.columns.filter(({ field }) => {
          return keys.indexOf(field) > -1
        })
      }
      return this.params.columns
    },
    typeOptions () {
      const none = { key: 'none', label: this.$t('common_103') }
      const project = { key: 'project', label: this.$t('common_104', [this.$t('dictionary.project')]) }
      const domain = { key: 'domain', label: this.$t('common_104', [this.$t('dictionary.domain')]) }
      if (this.resScope === 'domain') {
        return [none, domain]
      }
      if (this.resScope === 'project') {
        if (this.l3PermissionEnable && this.isAdminMode) {
          return [none, project, domain]
        }
        return [none, project]
      }
      return [none]
    },
    noShareMode () {
      return this.fd.type === 'none'
    },
    shareDomainMode () {
      return this.fd.type === 'domain'
    },
    shareProjectMode () {
      return this.fd.type === 'project'
    },
  },
  watch: {
    shareDomainMode: {
      handler (val) {
        if (val) {
          this.$nextTick(() => {
            this.fetchDomains()
          })
        }
      },
      immediate: true,
    },
    shareProjectMode: {
      handler (val) {
        if (val) {
          this.$nextTick(() => {
            this.fetchProjects()
          })
        }
      },
      immediate: true,
    },
  },
  beforeDestroy () {
    this.dm = null
    this.pm = null
    this.rm = null
  },
  created () {
    this.dm = new this.$Manager('domains', 'v1')
    this.pm = new this.$Manager('projects', 'v1')
    this.rm = new this.$Manager(this.params.resource, this.params.apiVersion || 'v2')
  },
  methods: {
    async fetchDomains (query) {
      const params = {
        details: true,
        scope: this.scope,
        limit: 20,
      }
      if (query) {
        params.search = query
      }
      try {
        let data
        // 是否需要加入全部选项
        let needAll = true
        if (!this.isBatch) {
          data = await this.fetchChangeOwnerCandidateDomains(query)
          if (data.length > 0) {
            needAll = false
          }
          if (data.length === 0) {
            const response = await this.dm.list({
              params,
            })
            data = response.data.data || []
          }
        } else {
          const response = await this.dm.list({
            params,
          })
          data = response.data.data || []
        }
        if (!this.isBatch && this.params.data[0].shared_domains && this.params.data[0].shared_domains.length) {
          data = this.mergeSharedRes(data, this.params.data[0].shared_domains)
        }
        if (needAll) {
          data.unshift({ id: 'all', name: this.$t('common_95') })
        }
        this.domains = data
        this.domainLoaded = true
      } catch (error) {
        throw error
      }
    },
    // 获取可用的domain list
    async fetchChangeOwnerCandidateDomains (query) {
      const params = {
        scope: this.scope,
        details: true,
        limit: 0,
      }
      if (query) {
        params.search = query
      }
      try {
        const response = await this.rm.getSpecific({
          id: this.params.data[0].id,
          spec: 'change-owner-candidate-domains',
        })
        const data = response.data.candidates || []
        return data
      } catch (error) {
        throw error
      }
    },
    async fetchProjects (query) {
      const params = {
        details: true,
        scope: this.scope,
        limit: 20,
        domain_id: this.params.data[0].domain_id,
      }
      if (!this.isBatch) {
        params.filter = `name.notin('${this.params.data[0].project}')`
      }
      if (query) {
        params.search = query
      }
      try {
        const response = await this.pm.list({
          params,
        })
        let data = response.data.data || []
        if (!this.isBatch && this.params.data[0].shared_projects && this.params.data[0].shared_projects.length) {
          data = this.mergeSharedRes(data, this.params.data[0].shared_projects)
        }
        data.unshift({ id: 'all', name: this.$t('common_95') })
        this.projects = data
        this.projectLoaded = true
      } catch (error) {
        throw error
      }
    },
    setPrivate (ids) {
      return this.params.onManager('batchPerformAction', {
        id: ids,
        managerArgs: {
          action: 'private',
        },
      })
    },
    setPublic (ids, data) {
      return this.params.onManager('batchPerformAction', {
        id: ids,
        managerArgs: {
          action: 'public',
          data,
        },
      })
    },
    handleTypeChange () {
      this.$nextTick(() => {
        this.$refs.form.validate()
      })
    },
    // 全部与选择项互斥交互
    handleHasAllSelect (val, field) {
      if (val === 'all') {
        this.fd[field] = ['all']
        return
      }
      const newVal = [...this.fd[field]]
      const allIndex = newVal.indexOf('all')
      const valIndex = newVal.indexOf(val)
      if (valIndex === -1) {
        newVal.push(val)
      }
      if (allIndex !== -1) {
        newVal.splice(allIndex, 1)
      }
      this.fd[field] = newVal
    },
    // 取消选中
    handleDeselect (val, field) {
      const newVal = [...this.fd[field]]
      const valIndex = newVal.indexOf(val)
      if (valIndex !== -1) {
        newVal.splice(valIndex, 1)
      }
      this.fd[field] = newVal
    },
    genShareDomainsData (domains) {
      const ret = {
        scope: 'domain',
      }
      if (domains[0] === 'all') {
        ret.scope = 'system'
      } else {
        ret.shared_domains = domains
      }
      return ret
    },
    genShareProjectsData (projects) {
      const ret = {
        scope: 'project',
      }
      if (projects[0] === 'all') {
        if (this.l3PermissionEnable) {
          ret.scope = 'domain'
        } else {
          ret.scope = 'system'
        }
      } else {
        ret.shared_projects = projects
      }
      return ret
    },
    // 合并已共享的资源，这样可以实现name的反显，不会有先显示id的问题
    mergeSharedRes (data, sharedData) {
      const ret = [...data]
      if (sharedData && sharedData.length > 0) {
        R.forEach(value => {
          const obj = R.find(R.propEq('id', value.id))(ret)
          if (!obj) {
            ret.push(obj)
          }
        })
      }
      return ret
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.$refs.form.validate()
        const ids = this.params.data.map(item => item.id)
        // 设置私有
        if (this.noShareMode) {
          await this.setPrivate(ids)
        }
        // 设置域共享
        if (this.shareDomainMode) {
          await this.setPublic(ids, this.genShareDomainsData(this.fd.shared_domains))
        }
        // 设置项目共享
        if (this.shareProjectMode) {
          await this.setPublic(ids, this.genShareProjectsData(this.fd.shared_projects))
        }
        this.loading = false
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
