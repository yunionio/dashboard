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
            :beforeDefaultSelectCallBack="beforeDomainDefaultSelectCallBack"
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
    /** selection：radio/单选 select/switch 类，local + session 双写、可跨 tab 回填 */
    formDraftKind: {
      type: String,
      default: 'selection',
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
  created () {
    // 进页互斥：有可回填草稿则不用 storage；无草稿才用 storage；最后 BaseSelect 兜底
    this._domainProjectPreferDraft = this.resolvePreferDraft()
  },
  mounted () {
    this.initDefaultData()
  },
  methods: {
    /** 从草稿/表单值取出 id（兼容 string | { key } | { id }） */
    pickId (val) {
      if (val == null || val === '') return ''
      if (typeof val === 'string' || typeof val === 'number') return String(val)
      if (typeof val === 'object') return val.key || val.id || ''
      return ''
    },
    pickLabel (val) {
      if (val && typeof val === 'object') return val.label || val.name || undefined
      return undefined
    },
    /**
     * 回填写入形态：按当前表单需要转换
     * - 需要 object（labelInValue）：存的是 id 也写成 { key, label }
     * - 需要 id：存的是 object 也只写 id
     */
    toFormValue (val) {
      const id = this.pickId(val)
      if (!id) return undefined
      if (this.labelInValue) {
        return { key: id, label: this.pickLabel(val) }
      }
      return id
    },
    /** 内部匹配用统一 { key, label } */
    toPrefer (val) {
      const id = this.pickId(val)
      if (!id) return null
      return { key: id, label: this.pickLabel(val) }
    },
    /**
     * 是否存在可回填的 domainProject 草稿
     */
    resolvePreferDraft () {
      if (!this.canRestoreFormFieldDraft()) return false
      const draft = this.readFormFieldDraft()
      if (!draft || typeof draft !== 'object') return false
      return !!(this.pickId(draft.domain) || this.pickId(draft.project))
    },
    /** 进页是否用 storage 回填 */
    shouldRestoreFromStorage () {
      return !this.ignoreStorage && !this._domainProjectPreferDraft
    },
    /** 草稿或 storage 偏好域（用于占位 + 远端插入） */
    getPreferDomainForSelect () {
      const cur = this.fc?.getFieldValue?.('domain')
      const curKey = this.pickId(cur)
      if (this._domainProjectPreferDraft) {
        const prefer = this.toPrefer(this.readFormFieldDraft()?.domain)
        if (prefer) {
          return {
            key: curKey || prefer.key,
            label: this.pickLabel(cur) || prefer.label,
          }
        }
      }
      if (this.shouldRestoreFromStorage() && (curKey || this.domain?.key)) {
        return {
          key: curKey || this.domain.key,
          label: this.pickLabel(cur) || this.domain.label,
        }
      }
      if (curKey) {
        return { key: curKey, label: this.pickLabel(cur) }
      }
      return null
    },
    /** 草稿或 storage 偏好项目（域不一致时不占用） */
    getPreferProjectForSelect () {
      const cur = this.fc?.getFieldValue?.('project')
      const curKey = this.pickId(cur)
      if (this._domainProjectPreferDraft) {
        const draft = this.readFormFieldDraft()
        const prefer = this.toPrefer(draft?.project)
        if (prefer) {
          const draftDomainId = this.pickId(draft?.domain)
          if (draftDomainId && this.domainId && String(draftDomainId) !== String(this.domainId)) {
            return null
          }
          return {
            key: curKey || prefer.key,
            label: this.pickLabel(cur) || prefer.label,
          }
        }
      }
      if (this.shouldRestoreFromStorage() && (curKey || this.project?.key)) {
        return {
          key: curKey || this.project.key,
          label: this.pickLabel(cur) || this.project.label,
        }
      }
      if (curKey) {
        return { key: curKey, label: this.pickLabel(cur) }
      }
      return null
    },
    /**
     * 偏好值不在首页：用 setFieldsValue 占住，交给 loadDefaultSelectedOpts 远端插入
     * @returns {boolean} true=放行 defaultSelect；false=已处理偏好
     */
    holdPreferSelect (list, prefer, selectRef, setInit) {
      if (!prefer?.key) return true
      const hit = Array.isArray(list) && list.find(i => String(i.id) === String(prefer.key) || String(i.key) === String(prefer.key))
      if (hit) {
        const next = {
          key: hit.id || hit.key || prefer.key,
          label: hit.name || hit.label || prefer.label,
        }
        setInit(next)
        const formVal = this.toFormValue(next)
        if (selectRef && typeof selectRef.change === 'function' && formVal != null) {
          selectRef.change(formVal)
        }
        return false
      }
      // 不在首页：只写表单 value（按表单需要 id/object），由 loadDefaultSelectedOpts 拉缺项
      setInit({ key: prefer.key, label: prefer.label })
      return false
    },
    /** 首页未命中时：先写表单，再调 BaseSelect.loadDefaultSelectedOpts 远端插入 */
    async applyPreferViaRemote (selectRef, prefer, applyFn) {
      if (!prefer?.key || !selectRef) return false
      const next = { key: prefer.key, label: prefer.label }
      if (typeof applyFn === 'function') applyFn(next)
      await this.$nextTick()
      if (typeof selectRef.loadDefaultSelectedOpts === 'function') {
        await selectRef.loadDefaultSelectedOpts()
      }
      return true
    },
    async initDefaultData () {
      // 再读一次：父级 provide / scope 在 created 时可能尚未完全就绪
      this._domainProjectPreferDraft = this.resolvePreferDraft()
      // 必须在任何 domainChange/_resetProject 之前拷贝，否则 storage 项目会被清掉
      const savedStorageProject = this.shouldRestoreFromStorage() && this.project?.key
        ? { key: this.project.key, label: this.project.label }
        : null
      if (this.isAdminMode && this.l3PermissionEnable) { // 系统视图
        let defaultDomain = { key: this.userInfo.projectDomainId, label: this.userInfo.projectDomain }
        let defaultProject = { key: this.userInfo.projectId, label: this.userInfo.projectName }
        const initialValue = _.get(this.decorators, 'domain[1].initialValue')
        if (R.is(Object, initialValue) && initialValue.key) {
          defaultDomain = { key: initialValue.key, label: initialValue.label }
        } else if (R.is(String, initialValue) && initialValue) {
          defaultDomain = { key: initialValue }
        }
        // 草稿 / storage 互斥预填域（未在首页时由 loadDefaultSelectedOpts 远端插入）
        if (this._domainProjectPreferDraft) {
          const prefer = this.toPrefer(this.readFormFieldDraft()?.domain)
          if (prefer) {
            defaultDomain = prefer
          }
        } else if (this.shouldRestoreFromStorage()) {
          const domainData = await this.$store.dispatch('storage/getDomainById', this.domain)
          if (domainData) {
            defaultDomain = { key: domainData.id, label: domainData.name }
          }
        }
        const projectInitialValue = _.get(this.decorators, 'project[1].initialValue')
        // 进页初始化：切域不清项目，避免清掉刚要回填的 storage / 草稿
        const applyDomain = () => {
          this.domainChange(defaultDomain || {}, { keepProject: true })
          this._setInitDomain(defaultDomain)
        }
        const applyProject = async () => {
          if (this.shouldRestoreFromStorage()) {
            const prefer = savedStorageProject || (this.project?.key ? this.project : null)
            if (prefer?.key) {
              const projectData = await this.$store.dispatch('storage/getProjectById', {
                ...prefer,
                project_domain: defaultDomain.key,
              })
              if (projectData) {
                defaultProject = { key: projectData.id, label: projectData.name }
                this.projectChange(defaultProject)
                this._setInitProject(defaultProject)
                return
              }
            }
            // 无 storage / 无效：回填当前用户所在项目
            if (defaultProject?.key) {
              this.projectChange(defaultProject)
              this._setInitProject(defaultProject)
            }
            return
          }
          // 草稿优先：预填草稿项目，首页未命中由 loadDefaultSelectedOpts 远端插入
          if (this._domainProjectPreferDraft) {
            const prefer = this.toPrefer(this.readFormFieldDraft()?.project)
            if (prefer) {
              defaultProject = prefer
              this._setInitProject(defaultProject)
              return
            }
          }
          if (R.is(Object, projectInitialValue) && projectInitialValue.key) {
            this.projectChange({ key: projectInitialValue.key, label: projectInitialValue.label })
            this._setInitProject({ key: projectInitialValue.key, label: projectInitialValue.label })
          } else if (R.is(String, projectInitialValue) && projectInitialValue) {
            this.projectChange({ key: projectInitialValue })
            this._setInitProject({ key: projectInitialValue })
          }
        }
        if (R.is(Object, projectInitialValue) && projectInitialValue.key) {
          defaultProject = { key: projectInitialValue.key, label: projectInitialValue.label }
          applyDomain()
          await applyProject()
        } else if (R.is(String, projectInitialValue) && projectInitialValue) {
          defaultProject = { key: projectInitialValue }
          applyDomain()
          await applyProject()
        } else if (this.isDefaultSelect) {
          applyDomain()
          await applyProject()
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
          this.domainChange(data[0], { keepProject: true })

          let defaultProject = { key: this.userInfo.projectId, label: this.userInfo.projectName }
          const initialProject = _.get(this.decorators, 'project[1].initialValue')
          if (R.is(Object, initialProject) && initialProject.key) {
            defaultProject = { key: initialProject.key, label: initialProject.label }
          } else if (R.is(String, initialProject) && initialProject) {
            defaultProject = { key: initialProject }
          }
          const applyProject = async () => {
            if (this.shouldRestoreFromStorage()) {
              const prefer = savedStorageProject || (this.project?.key ? this.project : null)
              if (prefer?.key) {
                const projectData = await this.$store.dispatch('storage/getProjectById', {
                  ...prefer,
                  project_domain: data[0]?.key,
                })
                if (projectData) {
                  defaultProject = { key: projectData.id, label: projectData.name }
                  this.projectChange(defaultProject)
                  this._setInitProject(defaultProject)
                  return
                }
              }
              // 无 storage / 无效：回填当前用户所在项目
              if (defaultProject?.key) {
                this.projectChange(defaultProject)
                this._setInitProject(defaultProject)
              }
              return
            }
            if (this._domainProjectPreferDraft) {
              const prefer = this.toPrefer(this.readFormFieldDraft()?.project)
              if (prefer) {
                defaultProject = prefer
                this._setInitProject(defaultProject)
                return
              }
            }
            if (R.is(Object, initialProject) && initialProject.key) {
              this.projectChange(defaultProject || {})
              this._setInitProject(defaultProject || {})
            } else if (R.is(String, initialProject) && initialProject) {
              this.projectChange(defaultProject || {})
              this._setInitProject(defaultProject || {})
            }
          }
          if (R.is(Object, initialProject) && initialProject.key) {
            await applyProject()
          } else if (R.is(String, initialProject) && initialProject) {
            await applyProject()
          } else if (this.isDefaultSelect) {
            await applyProject()
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
     * 回填写入：按表单需要 id / object 转换（与草稿存的形态无关）
     */
    _setInitDomain (domain) {
      const formVal = this.toFormValue(domain)
      if (formVal == null || formVal === '') return
      this.fc.setFieldsValue({ domain: formVal })
    },
    _setInitProject (project) {
      const formVal = this.toFormValue(project)
      if (formVal == null || formVal === '') return
      this.fc.setFieldsValue({ project: formVal })
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
     * domain {Object|String}
     * @param {Object} [options]
     * @param {boolean} [options.keepProject] 进页初始化时为 true，避免先清 storage 再读项目
     */
    domainChange (domain, options = {}) {
      const formVal = this.toFormValue(domain)
      const domainId = this.pickId(formVal != null ? formVal : domain)
      const domainChanged = domainId !== this.domainId
      // storage 仍用 { key, label }，与历史一致
      this.$store.commit('storage/SET_DOMAIN', this.toPrefer(domain) || {})
      if (this.labelInValue) {
        this.$emit('update:domain', formVal)
      } else {
        this.$emit('update:domain', domainId)
      }
      this.domainId = domainId
      if (domainChanged && !options.keepProject) {
        this._resetProject()
      }
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
      const formVal = this.toFormValue(project)
      const projectId = this.pickId(formVal != null ? formVal : project)
      const prefer = this.toPrefer(project)
      this.$store.commit('storage/SET_PROJECT', prefer || {})
      this.projectData = prefer || {}
      if (this.labelInValue) {
        this.$emit('update:project', formVal)
      } else {
        this.$emit('update:project', projectId)
      }
    },
    /**
     * 草稿 / storage 偏好域：不在首页时勿改第一项，交给 loadDefaultSelectedOpts
     */
    beforeDomainDefaultSelectCallBack (list) {
      return this.holdPreferSelect(
        list,
        this.getPreferDomainForSelect(),
        this.$refs.domain,
        (next) => this._setInitDomain(next),
      )
    },
    /**
     * 草稿 / storage 偏好项目：不在首页时勿改第一项，交给 loadDefaultSelectedOpts
     * 切域重建后无偏好 → return true，默认第一项
     */
    beforeProjectDefaultSelectCallBack (list) {
      return this.holdPreferSelect(
        list,
        this.getPreferProjectForSelect(),
        this.$refs.project,
        (next) => this._setInitProject(next),
      )
    },
    /**
     * opts 拉取完成后回填草稿域：首页命中直接回填；未命中则远端校验插入（同 storage）
     */
    async tryMatchDomainDraftInOptions (resList) {
      if (!this._domainProjectPreferDraft || !this.canRestoreFormFieldDraft()) return
      if (!Array.isArray(resList) || !resList.length) return
      const prefer = this.toPrefer(this.readFormFieldDraft()?.domain)
      if (!prefer) return
      const hit = this.matchFormFieldDraftInOptions(resList, prefer, {
        getId: item => item.id || item.key,
      })
      if (!hit) {
        if (this._domainDraftRemoteTried) return
        this._domainDraftRemoteTried = true
        await this.applyPreferViaRemote(
          this.$refs.domain,
          prefer,
          (val) => {
            this.domainChange(val, { keepProject: true })
            this._setInitDomain(val)
          },
        )
        return
      }
      const currentOk = this.domainId && String(this.domainId) === String(hit.id || hit.key)
      if (currentOk) return
      const val = { key: hit.id || hit.key, label: hit.name || hit.label }
      this.domainChange(val, { keepProject: true })
      this._setInitDomain(val)
    },
    /**
     * opts 拉取完成后回填草稿项目：首页命中直接回填；未命中则远端校验插入（同 storage）
     */
    async tryMatchProjectDraftInOptions (resList) {
      if (!this._domainProjectPreferDraft || !this.canRestoreFormFieldDraft()) return
      if (!Array.isArray(resList) || !resList.length) return
      const draft = this.readFormFieldDraft()
      if (!draft || typeof draft !== 'object') return
      const prefer = this.toPrefer(draft.project)
      if (!prefer) return
      // 草稿域与当前域不一致：勿用旧项目回填（切域后由 BaseSelect 默认）
      const draftDomainId = this.pickId(draft.domain)
      if (draftDomainId && String(draftDomainId) !== String(this.domainId)) return
      const hit = this.matchFormFieldDraftInOptions(resList, prefer, {
        getId: item => item.id || item.key,
      })
      if (!hit) {
        if (this._projectDraftRemoteTried) return
        this._projectDraftRemoteTried = true
        await this.applyPreferViaRemote(
          this.$refs.project,
          prefer,
          (val) => {
            this.projectChange(val)
            this._setInitProject(val)
          },
        )
        return
      }
      const currentId = this.pickId(this.projectData)
      const currentOk = currentId && String(currentId) === String(hit.id || hit.key)
      if (currentOk) return
      const val = { key: hit.id || hit.key, label: hit.name || hit.label }
      this.projectChange(val)
      this._setInitProject(val)
    },
    /** 落盘：按表单当前值原样存（id 存 id，object 存 object） */
    serializeFormFieldDraft () {
      const domain = this.fc?.getFieldValue?.('domain')
      const project = this.fc?.getFieldValue?.('project')
      const domainVal = this.pickId(domain)
        ? (typeof domain === 'object' ? { key: domain.key, label: domain.label } : this.pickId(domain))
        : (this.domainId || null)
      const projectVal = this.pickId(project)
        ? (typeof project === 'object' ? { key: project.key, label: project.label } : this.pickId(project))
        : (this.pickId(this.projectData) ? this.toPrefer(this.projectData) : null)
      if (!domainVal && !projectVal) return undefined
      return { domain: domainVal, project: projectVal }
    },
  },
}
</script>
