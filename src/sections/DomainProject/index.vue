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
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'

export default {
  name: 'DomainProject',
  mixins: [createFormFieldDraftMixin],
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
      default: () => ({}),
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
    /** 若传入，则域列表仅拉取该域（如主机模板所属域） */
    restrictDomainId: {
      type: String,
      default: '',
    },
    formDraftKey: {
      type: String,
      default: '',
    },
  },
  data () {
    return {
      domains: [],
      domainId: '',
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
    domainParams () {
      const ret = {
        scope: this.scope,
        limit: 20,
        filter: 'enabled.equals(1)', // 仅显示启用状态下的域
      }
      if (this.restrictDomainId) {
        const id = String(this.restrictDomainId).replace(/'/g, "\\'")
        ret.id = id
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
        let defaultProject = { key: this.userInfo.projectId, label: this.userInfo.projectName }
        const initialValue = _.get(this.decorators, 'domain[1].initialValue')
        if (R.is(Object, initialValue) && initialValue.key) {
          defaultDomain = { key: initialValue.key, label: initialValue.label }
        } else if (R.is(String, initialValue) && initialValue) {
          defaultDomain = { key: initialValue }
        }
        if (!this.ignoreStorage) {
          const draftPreferred = await this.resolveDomainProjectDraftPreferred(defaultDomain.key)
          if (draftPreferred.domain) {
            defaultDomain = draftPreferred.domain
          } else {
            const domainData = await this.$store.dispatch('storage/getDomainById', this.domain)
            if (domainData) {
              defaultDomain = { key: domainData.id, label: domainData.name }
            }
          }
          if (draftPreferred.project) {
            defaultProject = draftPreferred.project
          } else if (this.project?.key) {
            // 草稿关闭时兜底读本地记录；须在 domainChange（会 _resetProject 清空）之前取出
            const projectData = await this.$store.dispatch('storage/getProjectById', { ...this.project, project_domain: defaultDomain.key })
            if (projectData) {
              defaultProject = { key: projectData.id, label: projectData.name }
            }
          }
        }
        const projectInitialValue = _.get(this.decorators, 'project[1].initialValue')
        const domainChange = () => {
          this.domainChange(defaultDomain || {})
          this._setInitDomain(defaultDomain)
        }
        const projectChange = async () => {
          if (!this.ignoreStorage) {
            const draft = this.readFormFieldDraft()
            if (!(draft?.project?.key)) {
              const projectData = await this.$store.dispatch('storage/getProjectById', { ...this.project, project_domain: defaultDomain.key })
              if (projectData) {
                defaultProject = { key: projectData.id, label: projectData.name }
              }
            }
          }
          this.projectChange(defaultProject || {})
          this._setInitProject(defaultProject || {})
        }
        if (R.is(Object, projectInitialValue) && projectInitialValue.key) {
          defaultProject = { key: projectInitialValue.key, label: projectInitialValue.label }
          domainChange()
          projectChange()
        } else if (R.is(String, projectInitialValue) && projectInitialValue) {
          defaultProject = { key: projectInitialValue }
          domainChange()
          projectChange()
        } else {
          if (this.isDefaultSelect) {
            domainChange()
            projectChange()
          }
        }
        if (this.isDomainFirstLoadData) {
          this.$emit('fetchDomainCallback')
          this.isDomainFirstLoadData = false
        }
        await this.$nextTick()
        if (this.$refs.domain && this.$refs.domain.loadDefaultSelectedOpts) {
          this.$refs.domain.loadDefaultSelectedOpts()
        }
        if (this.$refs.project && this.$refs.project.loadDefaultSelectedOpts) {
          this.$refs.project.loadDefaultSelectedOpts()
        }
      } else {
        if (this.isDomainMode || this.isAdminMode) { // 域视图 和 没开三级权限的系统视图
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
            defaultProject = { key: initialProject }
          }
          const projectChange = async () => {
            if (!this.ignoreStorage) {
              const draftPreferred = await this.resolveDomainProjectDraftPreferred(this.domain?.key || data[0]?.key)
              if (draftPreferred.project) {
                defaultProject = draftPreferred.project
              } else {
                const projectData = await this.$store.dispatch('storage/getProjectById', { ...this.project, project_domain: this.domain?.key })
                if (projectData) {
                  defaultProject = { key: projectData.id, label: projectData.name }
                }
              }
            }
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
          if (this.$refs.project && this.$refs.project.loadDefaultSelectedOpts) {
            this.$refs.project.loadDefaultSelectedOpts()
          }
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
      this.tryMatchDomainDraftInOptions(resList)
    },
    updateProjectList (resList) {
      this.projects = resList
      this.tryMatchProjectDraftInOptions(resList)
    },
    /**
     * 草稿中的域/项目仍可用则返回偏好值（用接口校验存在性）
     * @param {string} [preferDomainId]
     * @returns {Promise<{ domain?: object, project?: object }>}
     */
    async resolveDomainProjectDraftPreferred (preferDomainId) {
      const ret = {}
      if (!this.canReadWriteFormFieldDraft()) return ret
      const draft = this.readFormFieldDraft()
      if (!draft || typeof draft !== 'object') return ret
      if (draft.domain?.key) {
        try {
          const domainData = await this.$store.dispatch('storage/getDomainById', draft.domain)
          if (domainData) {
            ret.domain = { key: domainData.id, label: domainData.name }
          }
        } catch (e) { /* ignore */ }
      }
      const domainKey = ret.domain?.key || preferDomainId
      if (draft.project?.key && domainKey) {
        try {
          const projectData = await this.$store.dispatch('storage/getProjectById', {
            ...draft.project,
            project_domain: domainKey,
          })
          if (projectData) {
            ret.project = { key: projectData.id, label: projectData.name }
          }
        } catch (e) { /* ignore */ }
      }
      return ret
    },
    tryMatchDomainDraftInOptions (resList) {
      if (!this.canReadWriteFormFieldDraft() || !Array.isArray(resList) || !resList.length) return
      const draft = this.readFormFieldDraft()
      const hit = this.matchFormFieldDraftInOptions(resList, draft?.domain, {
        getId: item => item.id || item.key,
      })
      if (!hit) return
      const currentOk = this.domainId && resList.some(d => (d.id || d.key) === this.domainId)
      if (currentOk) return
      const val = { key: hit.id || hit.key, label: hit.name || hit.label }
      this._domainProjectDraftRestoring = true
      this.domainChange(val)
      this._setInitDomain(val)
      this.$nextTick(() => { this._domainProjectDraftRestoring = false })
    },
    tryMatchProjectDraftInOptions (resList) {
      if (!this.canReadWriteFormFieldDraft() || !Array.isArray(resList) || !resList.length) return
      const draft = this.readFormFieldDraft()
      const hit = this.matchFormFieldDraftInOptions(resList, draft?.project, {
        getId: item => item.id || item.key,
      })
      if (!hit) return
      const currentId = R.is(Object, this.projectData) ? this.projectData.key : this.projectData
      const currentOk = currentId && resList.some(p => (p.id || p.key) === currentId)
      if (currentOk) return
      const val = { key: hit.id || hit.key, label: hit.name || hit.label }
      this._domainProjectDraftRestoring = true
      this.projectChange(val)
      this._setInitProject(val)
      this.$nextTick(() => { this._domainProjectDraftRestoring = false })
    },
    serializeFormFieldDraft () {
      const domain = this.fc?.getFieldValue?.('domain')
      const project = this.fc?.getFieldValue?.('project')
      const domainVal = domain && (domain.key || domain)
        ? (R.is(Object, domain) ? { key: domain.key, label: domain.label } : { key: domain })
        : (this.domainId ? { key: this.domainId } : null)
      const projectVal = project && (project.key || project)
        ? (R.is(Object, project) ? { key: project.key, label: project.label } : { key: project })
        : (this.projectData?.key ? { key: this.projectData.key, label: this.projectData.label } : null)
      if (!domainVal && !projectVal) return undefined
      return { domain: domainVal, project: projectVal }
    },
    /**
     * domain {Object|String}
     */
    domainChange (domain) {
      const domainId = R.is(Object, domain) ? domain.key : (domain || '')
      const domainChanged = domainId !== this.domainId
      this.$store.commit('storage/SET_DOMAIN', domain)
      if (this.labelInValue) {
        this.$emit('update:domain', domain)
      } else {
        this.$emit('update:domain', domainId)
      }
      this.domainId = domainId
      if (domainChanged) {
        this._resetProject()
      }
      this.$nextTick(() => {
        // options 就绪后的程序化回填不落盘
        if (this._domainProjectDraftRestoring) return
        const data = this.serializeFormFieldDraft()
        if (data !== undefined) this.writeFormFieldDraft(data)
      })
    },
    _resetProject () {
      this.$store.commit('storage/SET_PROJECT', {})
      this.projectData = {}
      this.fc.setFieldsValue({ project: undefined })
      this.$emit('update:project', undefined)
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
      this.$nextTick(() => {
        if (this._domainProjectDraftRestoring) return
        const data = this.serializeFormFieldDraft()
        if (data !== undefined) this.writeFormFieldDraft(data)
      })
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
