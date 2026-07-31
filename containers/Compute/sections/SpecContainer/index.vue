<template>
  <div>
    <a-tabs hideAdd v-model="active" type="editable-card" @edit="onEdit" @change="handleTabChange" class="spec-container-tabs">
      <a-tab-pane v-for="(pane, i) in panes" :key="pane.key" :closable="panes.length > 1" :forceRender="true">
        <template v-slot:tab>
          <a-badge :dot="showBadge(pane)" :offset="[(panes.length > 1 ? 24 : 10), -5]">
            <span>{{$t('compute.container', [i+1])}}</span>
          </a-badge>
        </template>
        <spec-container-form
          :ref="`form_${pane.key}`"
          :decorators="getDecorators(pane.key)"
          :cluster="cluster"
          :namespace="namespace"
          :form="form"
          :paneKey="pane.key"
          :initItem="initContainers[i] || null"
          @draft-change="persistFormFieldDraftSnapshot" />
      </a-tab-pane>
      <a-tab-pane key="add-tab" class="add-container-tab" :closable="false">
        <template v-slot:tab>
          <a-button type="dashed" size="small" @click.stop="add" icon="plus">{{$t('compute.add_container')}}</a-button>
        </template>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import * as R from 'ramda'
import { uuid } from '@/utils/utils'
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'
import SpecContainerForm from './Form'

export default {
  name: 'SpecContainers',
  components: {
    SpecContainerForm,
  },
  mixins: [createFormFieldDraftMixin],
  props: {
    formDraftKey: {
      type: String,
      default: '',
    },
    decorators: {
      type: Object,
      required: true,
    },
    cluster: String,
    namespace: String,
    form: {
      type: Object,
      validator: v => v.fc,
    },
    errPanes: {
      type: Array,
      default: () => [],
    },
    /** 修改工单反填：pod.containers */
    initContainers: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    const initCount = Math.max((this.initContainers && this.initContainers.length) || 0, 1)
    const panes = Array.from({ length: initCount }, () => ({ key: uuid() }))
    return {
      active: panes[0].key,
      panes,
    }
  },
  watch: {
    initContainers: {
      deep: true,
      handler (val) {
        if (!val || !val.length) return
        this.ensurePaneCount(val.length)
      },
    },
  },
  created () {
    this._containersDraftRestoring = false
    this.syncPanes()
  },
  methods: {
    syncPanes () {
      this.$emit('update:panes', this.panes)
    },
    showBadge (pane) {
      return this.errPanes.includes(pane.key)
    },
    ensurePaneCount (count) {
      const n = Math.max(count || 0, 1)
      while (this.panes.length < n) {
        this.panes.push({ key: uuid() })
      }
      if (this.panes.length > n) {
        this.panes = this.panes.slice(0, n)
      }
      this.active = this.panes[0].key
      this.syncPanes()
    },
    add () {
      const key = uuid()
      this.panes.push({
        key,
      })
      this.active = key
      this.syncPanes()
      this.$nextTick(() => this.persistFormFieldDraftSnapshot())
    },
    fillContainers (containers = []) {
      this.ensurePaneCount(containers.length)
      this.$nextTick(() => {
        this.panes.forEach((pane, i) => {
          const item = containers[i]
          if (!item) return
          const formRef = this.$refs[`form_${pane.key}`]
          const formComp = Array.isArray(formRef) ? formRef[0] : formRef
          if (formComp && formComp.applyInitData) {
            formComp.initApplied = false
            formComp.applyInitData(item)
          }
        })
      })
      return this.panes.map(p => p.key)
    },
    initFromContainers (containers = []) {
      return this.fillContainers(containers)
    },
    onEdit (targetKey, action) {
      if (action === 'remove') {
        const index = this.panes.findIndex(val => val.key === targetKey)
        this.panes.splice(index, 1)
        if (this.active === targetKey) {
          this.active = this.panes[0].key
        }
        this.syncPanes()
        this.$nextTick(() => this.persistFormFieldDraftSnapshot())
      }
    },
    handleTabChange (key) {
      if (key === 'add-tab') {
        this.add()
      }
    },
    persistFormFieldDraftSnapshot (options = {}) {
      if (this._containersDraftRestoring) return
      const data = this.serializeFormFieldDraft()
      if (data !== undefined) this.writeFormFieldDraft(data, options)
    },
    getDecorators (k) {
      const ret = {}
      R.forEachObjIndexed((item, key) => {
        if (R.is(Function, item)) {
          ret[key] = item(k)
        }
      }, this.decorators)
      return ret
    },
    /**
     * 序列化为与工单/applyInitData 兼容的 containers 列表
     */
    getCreateFormFieldDraftSnapshot () {
      if (!this.form?.fc || !this.panes?.length) return undefined
      const values = this.form.fc.getFieldsValue()
      const list = this.panes.map((pane) => {
        const k = pane.key
        const credentialId = values.imageCredentialIds?.[k]
        const registryImage = values.registryImages?.[k]
        const customImage = values.containerimages?.[k]
        const commandStr = values.containerCommands?.[k]
        const argStr = values.containerArgs?.[k]
        const envNames = values.containerEnvNames?.[k]
        const envValues = values.containerEnvValues?.[k]
        const mountNames = values.containerVolumeMountNames?.[k]
        const mountPaths = values.containerVolumeMountPaths?.[k]
        const envs = []
        if (envNames && typeof envNames === 'object') {
          Object.keys(envNames).forEach((j) => {
            if (envNames[j] == null || envNames[j] === '') return
            envs.push({ key: envNames[j], value: (envValues && envValues[j]) || '' })
          })
        }
        const volume_mounts = []
        if (mountNames && typeof mountNames === 'object') {
          Object.keys(mountNames).forEach((j) => {
            const idx = mountNames[j]
            if (idx == null || idx === '') return
            volume_mounts.push({
              type: 'disk',
              disk: { index: Number(idx) },
              mount_path: (mountPaths && mountPaths[j]) || '',
            })
          })
        }
        const item = {
          name: values.containerNames?.[k] || '',
          image: (credentialId ? registryImage : customImage) || registryImage || customImage || '',
          command: commandStr ? String(commandStr).split(' ').filter(Boolean) : [],
          args: argStr ? String(argStr).split(' ').filter(Boolean) : [],
          privileged: !!values.containerPrivilegeds?.[k],
          enable_lxcfs: values.containerEnableLxcfs?.[k] !== false,
          capabilities: {
            add: values.containerCapAdd?.[k] || [],
            drop: values.containerCapDrop?.[k] || [],
          },
          envs,
          volume_mounts,
        }
        if (credentialId) {
          item.image_credential_id = credentialId
        }
        if (values.containerEnableSysDiskOverlay?.[k]) {
          const sizes = values.overlayDiskSizes?.[k]
          const types = values.overlayDiskTypes?.[k]
          let sizeGb
          let backend
          let medium
          if (sizes && typeof sizes === 'object') {
            const firstKey = Object.keys(sizes)[0]
            if (firstKey != null) {
              sizeGb = sizes[firstKey]
              const typeObj = types?.[firstKey]
              const typeKey = (typeObj && typeObj.key) || ''
              if (typeKey) {
                const parts = String(typeKey).split('/')
                backend = parts[0] || typeKey
                medium = parts[1]
              }
            }
          }
          item.rootfs = {
            type: 'disk',
            disk: {
              index: 0,
              sub_directory: 'rootfs',
              ...(sizeGb != null ? { size: Number(sizeGb) } : {}),
              ...(backend ? { backend } : {}),
              ...(medium ? { medium } : {}),
            },
            persistent: !!values.containerRootfsPersistent?.[k],
          }
        }
        return item
      })
      // 全空默认项不落盘
      const hasContent = list.some((c) => {
        return !!(c.name || c.image || (c.command && c.command.length) || (c.args && c.args.length) ||
          (c.envs && c.envs.length) || (c.volume_mounts && c.volume_mounts.length) ||
          c.image_credential_id || c.rootfs || c.privileged ||
          (c.capabilities?.add?.length) || (c.capabilities?.drop?.length))
      })
      return hasContent ? list : undefined
    },
    applyCreateFormFieldDraft (draft) {
      if (!Array.isArray(draft) || !draft.length) return
      if (this._containersDraftRestoring) return
      this._containersDraftRestoring = true
      this.fillContainers(draft)
      // applyInitData 含 overlay add 延迟，拉长保护窗口
      setTimeout(() => {
        this._containersDraftRestoring = false
      }, 2000)
    },
  },
}
</script>

<style lang="less" scoped>
.spec-container-tabs :deep(.ant-tabs-tab:last-child) {
  background: transparent !important;
  border: none !important;
}

.spec-container-tabs :deep(.ant-tabs-tab:last-child:hover) {
  background: transparent !important;
}

.spec-container-tabs :deep(.ant-tabs-tab:last-child.ant-tabs-tab-active) {
  background: transparent !important;
  border: none !important;
}
</style>
