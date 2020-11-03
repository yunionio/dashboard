<template>
  <div>
    <a-form-item :label="$t('cloudenv.text_502')" v-bind="formItemLayout">
      <a-radio-group v-decorator="decorators.scope" @change="handleScopeChange">
        <a-radio-button value="system">{{$t('cloudenv.text_504')}}</a-radio-button>
        <a-radio-button value="domain" v-if="l3PermissionEnable">{{$t('cloudenv.text_393')}}</a-radio-button>
        <a-radio-button value="project">{{$t('cloudenv.text_254')}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <!-- 项目选择 -->
    <template v-if="shareProjectMode">
      <a-form-item :label="$t('dictionary.project')" v-bind="formItemLayout">
        <template v-if="projectLoaded">
          <a-select
            v-decorator="decorators.projects"
            mode="multiple"
            :filterOption="false"
            @search="fetchProjects"
            @select="val => handleHasAllSelect(val, 'projects')"
            @deselect="val => handleDeselect(val, 'projects')"
            :placeholder="$t('rules.project')">
            <template v-for="item of projects">
              <a-select-option :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
            </template>
          </a-select>
        </template>
        <template v-else>
          <a-spin />
        </template>
      </a-form-item>
    </template>
    <!-- 域选择 -->
    <template v-if="shareDomainMode">
      <a-form-item :label="$t('dictionary.domain')" v-bind="formItemLayout">
        <template v-if="domainLoaded">
          <a-select
            v-decorator="decorators.domains"
            mode="multiple"
            :filterOption="false"
            @search="fetchDomains"
            @select="val => handleHasAllSelect(val, 'domains')"
            @deselect="val => handleDeselect(val, 'domains')"
            :placeholder="$t('rules.domain')">
            <template v-for="item of domains">
              <a-select-option :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
            </template>
          </a-select>
        </template>
        <template v-else>
          <a-spin />
        </template>
      </a-form-item>
    </template>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ScopeApplication',
  inject: ['form'],
  data () {
    return {
      loading: false,
      decorators: {
        scope: [
          'scope',
          {
            initialValue: 'system',
            rules: [
              { required: true, message: this.$t('cloudenv.text_550') },
            ],
          },
        ],
        projects: [
          'projects',
          {
            rules: [
              { required: true, message: this.$t('cloudenv.text_551') },
            ],
          },
        ],
        domains: [
          'domains',
          {
            rules: [
              { required: true, message: this.$t('cloudenv.text_552') },
            ],
          },
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
      selectedScopeType: 'system',
      domainLoaded: false,
      domains: [],
      projectLoaded: false,
      projects: [],
    }
  },
  computed: {
    ...mapGetters(['scope', 'l3PermissionEnable', 'isAdminMode']),
    shareDomainMode () {
      return this.selectedScopeType === 'domain'
    },
    shareProjectMode () {
      return this.selectedScopeType === 'project'
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
  },
  created () {
    this.dm = new this.$Manager('domains', 'v1')
    this.pm = new this.$Manager('projects', 'v1')
  },
  methods: {
    handleScopeChange (e) {
      this.selectedScopeType = e.target.value
    },
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
        // 是否需要加入全部选项
        const response = await this.dm.list({
          params,
        })
        const { data: { data = [] } } = response
        data.unshift({ id: '[any_domain_id]', name: this.$t('common_95') })
        this.domains = data
        this.domainLoaded = true
      } catch (error) {
        throw error
      }
    },
    async fetchProjects (query) {
      const params = {
        details: true,
        scope: this.scope,
        limit: 20,
      }
      if (query) {
        params.search = query
      }
      try {
        const response = await this.pm.list({
          params,
        })
        const { data: { data = [] } } = response
        this.projects = data
        this.projectLoaded = true
      } catch (error) {
        throw error
      }
    },
    // 全部与选择项互斥交互
    handleHasAllSelect (val, field) {
      if (val === '[any_domain_id]') {
        this.form.fc.setFieldsValue({
          [field]: ['[any_domain_id]'],
        })
        return
      }
      const newVal = [...this.form.fc.getFieldValue(field)]
      const allIndex = newVal.indexOf('[any_domain_id]')
      const valIndex = newVal.indexOf(val)
      if (valIndex === -1) {
        newVal.push(val)
      }
      if (allIndex !== -1) {
        newVal.splice(allIndex, 1)
      }
      this.form.fc.setFieldsValue({
        [field]: newVal,
      })
    },
    // 取消选中
    handleDeselect (val, field) {
      const newVal = [...this.form.fc.getFieldValue(field)]
      const valIndex = newVal.indexOf(val)
      if (valIndex !== -1) {
        newVal.splice(valIndex, 1)
      }
      this.form.fc.setFieldsValue({
        [field]: newVal,
      })
    },
  },
}
</script>
