<template>
  <div>
    <template v-if="!isAdminMode && !isDomainMode">
      <div style="margin-bottom: 24px;">{{ projectData.label }}</div>
    </template>
    <a-row :gutter="8" v-else>
      <a-col :span="12">
        <a-form-item :class="{ 'mb-0': mb0 }" v-if="isAdminMode && l3PermissionEnable" :wrapperCol="{ span: 24 }">
          <base-select
            ref="domain"
            v-decorator="decorators.domain"
            resource="domains"
            remote
            :is-default-select="isDefaultSelect"
            :params="domainParams"
            :select-props="{
              allowClear,
              labelInValue,
              placeholder: $t('rules.domain'),
              dropdownClassName: 'oc-select-dropdown',
              labelInValueKeyName: 'key',
            }"
            @change="domainChange"
            @update:resList="updateDomainList">
            <template #optionLabelTemplate="{ item }">
              <span class="text-color-secondary option-prefix">{{ $t('dictionary.domain') }}: </span>{{ item.name }}
            </template>
          </base-select>
        </a-form-item>
      </a-col>
      <a-col :span="(isAdminMode && l3PermissionEnable) ? 12 : 24">
        <a-form-item :class="{ 'mb-0': mb0 }" :wrapperCol="{ span: 24 }">
          <base-select
            ref="project"
            v-decorator="decorators.project"
            resource="projects"
            remote
            :is-default-select="isDefaultSelect"
            :params="projectParams"
            :select-props="{
              allowClear,
              labelInValue,
              placeholder: $t('rules.project'),
              dropdownClassName: 'oc-select-dropdown',
              labelInValueKeyName: 'key',
            }"
            :beforeDefaultSelectCallBack="beforeProjectDefaultSelectCallBack"
            @change="projectChange"
            @update:resList="updateProjectList">
            <template #optionLabelTemplate="{ item }">
              <span class="text-color-secondary option-prefix">{{ $t('dictionary.project') }}: </span>{{ item.name }}
            </template>
          </base-select>
        </a-form-item>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'DomainProject',
  props: {
    labelInValue: {
      type: Boolean,
      default: true,
    },
    decorators: {
      type: Object,
      validator: val => R.is(Array, val.domain) && R.is(Array, val.project),
    },
    fc: {
      type: Object,
      required: true,
    },
    fd: {
      type: Object,
      required: true,
    },
    allowClear: Boolean,
    isDefaultSelect: {
      type: Boolean,
      default: true,
    },
    mb0: {
      type: Boolean,
      default: true,
    },
    ignoreStorage: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      domains: [],
      domainId: '',
      domainParams: {
        scope: this.scope,
        limit: 20,
        filter: 'enabled.equals(1)', // 仅显示启用状态下的域
      },
      projectData: {},
      projects: [],
      isDomainFirstLoadData: true,
      isProjectFirstLoadData: true,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
    ...mapState('storage', {
      domain: state => state.domain,
      project: state => state.project,
    }),
    projectParams () {
      const ret = {
        scope: this.scope,
        limit: 20,
      }
      const domainId = this.domainId
      if (domainId && !this.isDomainMode) {
        ret.domain_id = domainId
      }
      if (this.isAdminMode) {
        delete ret.scope
        delete ret.domain_id
        ret.project_domain = domainId || this.userInfo.projectDomainId
      }
      return ret
    },
  },
  mounted () {
    this.initDefaultData()
  },
  methods: {
    async initDefaultData () {
      if (this.isAdminMode && this.l3PermissionEnable) { // 系统视图
        let defaultDomain = { key: this.userInfo.projectDomainId, label: this.userInfo.projectDomain }
        const initialValue = _.get(this.decorators, 'domain[1].initialValue')
        if (R.is(Object, initialValue) && initialValue.key) {
          defaultDomain = { key: initialValue.key, label: initialValue.label }
        } else if (R.is(String, initialValue) && initialValue) {
          defaultDomain = { key: initialValue }
        }
        if (!this.ignoreStorage) {
          const domainData = await this.$store.dispatch('storage/getDomainById', this.domain)
          if (domainData) {
            defaultDomain = this.domain
          }
        }
        const projectInitialValue = _.get(this.decorators, 'project[1].initialValue')
        const domainChange = () => {
          this._setInitDomain(defaultDomain)
          this.domainChange(defaultDomain || {})
        }
        if (R.is(Object, projectInitialValue) && projectInitialValue.key) {
          domainChange()
        } else if (R.is(String, projectInitialValue) && projectInitialValue) {
          domainChange()
        } else {
          if (this.isDefaultSelect) {
            domainChange()
          }
        }
        if (this.isDomainFirstLoadData) {
          this.$emit('fetchDomainCallback')
          this.isDomainFirstLoadData = false
        }
        await this.$nextTick()
        this.$refs.domain.loadDefaultSelectedOpts()
      } else {
        if (this.isDomainMode) { // 域视图
          const data = [{
            key: this.userInfo.projectDomainId,
            label: this.userInfo.projectDomain,
          }]
          this.domains = data
          this.domainChange(data[0])

          let defaultProject = { key: this.userInfo.projectId, label: this.userInfo.projectName }
          const initialProject = _.get(this.decorators, 'project[1].initialValue')
          if (R.is(Object, initialProject) && initialProject.key) {
            defaultProject = { key: initialProject.key, label: initialProject.label }
          } else if (R.is(String, initialProject) && initialProject) {
            defaultProject = { key: initialProject.key, label: initialProject.label }
          }
          const projectChange = () => {
            this.projectChange(defaultProject || {})
            this._setInitProject(defaultProject || {})
          }
          if (R.is(Object, initialProject) && initialProject.key) {
            projectChange()
          } else if (R.is(String, initialProject) && initialProject) {
            projectChange()
          } else {
            if (this.isDefaultSelect) {
              projectChange()
            }
          }
          if (this.isProjectFirstLoadData) {
            this.$emit('fetchProjectCallback')
            this.isProjectFirstLoadData = false
          }
          await this.$nextTick()
          this.$refs.project.loadDefaultSelectedOpts()
        } else { // 普通视图
          const data = [{
            key: this.userInfo.projectId,
            label: this.userInfo.projectName,
          }]
          this.projects = data
          // 普通视图下不用判断 isDefaultSelect
          this.projectChange(data[0])
          this._setInitProject(data[0])
        }
      }
    },
    /*
     * @params {Object} domain { key: <domainId> }
     */
    _setInitDomain (domain) {
      if (!R.isNil(domain) && !R.isEmpty(domain)) {
        if (this.labelInValue) {
          this.fc.setFieldsValue({
            domain: { key: domain.key, label: domain.label },
          })
        } else {
          this.fc.setFieldsValue({
            domain: domain.key,
          })
        }
      }
    },
    /*
     * @params {Object} project { key: <projectId> }
     */
    _setInitProject (project) {
      if (!R.isNil(project) && !R.isEmpty(project)) {
        if (this.labelInValue) {
          this.fc.setFieldsValue({
            project: { key: project.key, label: project.label },
          })
        } else {
          this.fc.setFieldsValue({
            project: project.key,
          })
        }
      }
    },
    updateDomainList (resList) {
      this.domains = resList
    },
    updateProjectList (resList) {
      this.projects = resList
    },
    /**
     * domain {Object|String}
     */
    domainChange (domain) {
      this.$store.commit('storage/SET_DOMAIN', domain)
      const domainId = R.is(Object, domain) ? domain.key : domain
      if (this.labelInValue) {
        this.$emit('update:domain', domain)
      } else {
        this.$emit('update:domain', domainId)
      }
      this.domainId = domainId
    },
    /**
     * project {Object|String}
     */
    projectChange (project) {
      this.$store.commit('storage/SET_PROJECT', project)
      const projectId = R.is(Object, project) ? project.key : project
      this.projectData = project
      if (this.labelInValue) {
        this.$emit('update:project', project)
      } else {
        this.$emit('update:project', projectId)
      }
    },
    async beforeProjectDefaultSelectCallBack () {
      try {
        if (!this.project?.key) return true
        const project = await this.$store.dispatch('storage/getProjectById', this.project)
        if (project) {
          this._setInitProject({ key: project.id, label: project.name })
          return false
        }
      } catch (error) {
        return true
      }
    },
  },
}
</script>
