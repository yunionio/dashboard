<template>
  <base-dialog :width="900" @cancel="cancelDialog">
    <div slot="header">{{ params.type === 'edit' ? $t('table.action.modify') : $t('common.create') }}</div>
    <div slot="body">
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-model-item :label="$t('common.name')" prop="name">
          <a-input v-model="form.name" :placeholder="$t('common.tips.input', [$t('common.name')])" :disabled="type === 'edit'" />
        </a-form-model-item>
        <a-form-model-item :label="$t('compute.repo.image.source')">
          <a-radio-group :value="source" @change="onSourceChange">
            <a-radio-button value="manual">{{ $t('compute.repo.image.custom') }}</a-radio-button>
            <a-radio-button value="registry">{{ $t('compute.repo.image.registry') }}</a-radio-button>
          </a-radio-group>
        </a-form-model-item>

        <template v-if="source === 'registry'">
          <a-form-model-item :label="$t('dictionary.container_registry')" prop="registry_id">
            <a-select
              v-model="form.registry_id"
              showSearch
              :filterOption="filterOption"
              :loading="registryLoading"
              :placeholder="$t('common.tips.select', [$t('dictionary.container_registry')])"
              allowClear
              @change="handleRegistryChange">
              <a-select-option
                v-for="r in registries"
                :key="r.id"
                :value="r.id"
                :label="r.name">
                <div>{{ r.name }}</div>
                <div style="font-size: 12px; color: #999;">{{ r.url }}</div>
              </a-select-option>
            </a-select>
          </a-form-model-item>

          <template v-if="isCustomRegistry">
            <a-alert type="info" show-icon class="mb-2" :message="$t('compute.repo.image.container_image.custom_registry_tip')" />
            <a-form-model-item :label="$t('compute.repo.image.name')" prop="image_name">
              <a-input
                v-model="form.image_name"
                :addonBefore="registryPrefixAddon"
                :placeholder="$t('common.tips.input', [$t('compute.repo.image.name')])" />
            </a-form-model-item>
            <a-form-model-item :label="$t('compute.repo.image.tag')" prop="image_label">
              <a-input v-model="form.image_label" :placeholder="$t('common.tips.input', [$t('compute.repo.image.tag')])" />
              <div v-if="previewFinalImage" style="font-size: 12px; color: #999; margin-top: 4px;">{{ previewFinalImage }}</div>
            </a-form-model-item>
          </template>
          <template v-else-if="form.registry_id">
            <a-form-model-item :label="$t('compute.repo.image.name')" prop="image_name">
              <a-select
                v-model="form.image_name"
                showSearch
                :filterOption="filterOption"
                :loading="imageLoading"
                :placeholder="$t('common.tips.select', [$t('compute.repo.image.name')])"
                allowClear
                @change="handleImageNameChange">
                <a-select-option
                  v-for="img in imageOptions"
                  :key="img.value"
                  :value="img.value"
                  :label="img.label">{{ img.label }}</a-select-option>
              </a-select>
            </a-form-model-item>
            <a-form-model-item :label="$t('compute.repo.image.tag')" prop="image_label">
              <a-select
                v-model="form.image_label"
                showSearch
                :filterOption="filterOption"
                :loading="tagLoading"
                :placeholder="$t('common.tips.select', [$t('compute.repo.image.tag')])"
                allowClear>
                <a-select-option
                  v-for="tag in tagOptions"
                  :key="tag.value"
                  :value="tag.value"
                  :label="tag.label">{{ tag.label }}</a-select-option>
              </a-select>
              <div v-if="previewFinalImage" style="font-size: 12px; color: #999; margin-top: 4px;">{{ previewFinalImage }}</div>
            </a-form-model-item>
          </template>
        </template>

        <template v-else>
          <a-form-model-item :label="$t('compute.repo.image.name')" prop="image_name">
            <a-input v-model="form.image_name" :placeholder="$t('common.tips.input', [$t('compute.repo.image.name')])" />
          </a-form-model-item>
          <a-form-model-item :label="$t('compute.repo.image.tag')" prop="image_label">
            <a-input v-model="form.image_label" :placeholder="$t('common.tips.input', [$t('compute.repo.image.tag')])" />
          </a-form-model-item>
        </template>

        <a-form-model-item
          :label="$t('common.container_image_secret')"
          prop="credential_id"
          :extra="source === 'registry' ? $t('compute.repo.image.container_image.credential_inherit_tip') : undefined">
          <base-select
            v-model="form.credential_id"
            resource="credentials"
            version="v1"
            :params="credentialParams"
            :selectProps="{ placeholder: $t('common.tips.select', [$t('common.container_image_secret')]), allowClear: true }" />
        </a-form-model-item>

        <a-form-model-item :label="$t('compute.repo.command')" :extra="$t('compute.repo.image.container_image.command_tip')">
          <a-input
            v-model="form.command"
            :placeholder="$t('common.tips.input', [$t('compute.repo.command')])" />
        </a-form-model-item>
        <a-form-model-item :label="$t('compute.repo.command.params')" :extra="$t('compute.repo.image.container_image.args_tip')">
          <a-input
            v-model="form.args"
            :placeholder="$t('common.tips.input', [$t('compute.repo.command.params')])" />
        </a-form-model-item>
        <a-form-model-item :label="$t('compute.repo.env_variables')" :extra="$t('compute.repo.image.container_image.env_tip')">
          <div v-for="(item, idx) in envList" :key="item.id" class="d-flex align-items-center mb-2">
            <a-input v-model="item.key" :placeholder="$t('compute.repo.key')" />
            <span class="mx-2">=</span>
            <a-input v-model="item.value" :placeholder="$t('compute.repo.value')" />
            <a-button class="ml-2" shape="circle" size="small" icon="minus" @click="removeEnv(idx)" />
          </div>
          <a-button type="link" @click="addEnv">{{ $t('compute.repo.add', [$t('compute.repo.variables')]) }}</a-button>
        </a-form-model-item>
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { validateModelForm } from '@/utils/validate'
import { uuid } from '@/utils/utils'

export default {
  name: 'ContainerImageCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const data = this.params.type === 'edit' ? this.params.data[0] : {}
    const hasRegistry = !!data.registry_id
    return {
      loading: false,
      type: this.params.type,
      source: hasRegistry ? 'registry' : 'manual',
      registryLoading: false,
      imageLoading: false,
      tagLoading: false,
      registries: [],
      imageOptions: [],
      tagOptions: [],
      envList: (data.envs || []).map(env => ({ id: uuid(), key: env.key || '', value: env.value || '' })),
      // edit 时暂存完整 image_name，等 registries 加载后再拆前缀
      pendingFullImageName: hasRegistry ? (data.image_name || '') : '',
      form: {
        name: data.name || undefined,
        image_name: hasRegistry ? undefined : (data.image_name || undefined),
        image_label: data.image_label || undefined,
        registry_id: data.registry_id || undefined,
        credential_id: data.credential_id || undefined,
        command: (data.command || []).join(' ') || undefined,
        args: (data.args || []).join(' ') || undefined,
      },
      rules: {
        name: [{ required: true, validator: this.$validate('imageName') }],
        registry_id: [{
          validator: (rule, value, callback) => {
            if (this.source === 'registry' && !value) {
              callback(new Error(this.$t('common.tips.select', [this.$t('dictionary.container_registry')])))
            } else {
              callback()
            }
          },
        }],
        image_name: [{ required: true, message: this.$t('common.tips.input', [this.$t('compute.repo.image.name')]) }],
        image_label: [{ required: true, message: this.$t('common.tips.input', [this.$t('compute.repo.image.tag')]) }],
      },
    }
  },
  computed: {
    credentialParams () {
      return {
        details: true,
        scope: this.$store.getters.scope,
        type: 'container_image',
      }
    },
    selectedRegistry () {
      return this.registries.find(r => r.id === this.form.registry_id)
    },
    isCustomRegistry () {
      return this.selectedRegistry?.type === 'custom'
    },
    registryHostPrefix () {
      return this.stripProtocol(this.selectedRegistry?.url || '')
    },
    registryPrefixAddon () {
      const p = this.registryHostPrefix
      return p ? `${p}/` : ''
    },
    previewFinalImage () {
      if (this.source !== 'registry' || !this.form.registry_id || !this.form.image_name || !this.form.image_label) {
        return ''
      }
      const fullName = this.joinRegistryPrefix(this.registryHostPrefix, this.form.image_name)
      return `${fullName}:${this.form.image_label}`
    },
  },
  created () {
    if (this.source === 'registry') {
      this.fetchRegistries().then(() => {
        this.applyPendingImageName()
        if (this.form.registry_id && !this.isCustomRegistry) {
          this.fetchImages(this.form.registry_id, true)
        }
      })
    }
  },
  methods: {
    stripProtocol (url) {
      return (url || '').replace(/^https?:\/\//, '').replace(/\/+$/, '')
    },
    stripRegistryPrefix (fullName, prefix) {
      if (!fullName) return ''
      if (!prefix) return fullName
      if (fullName === prefix) return ''
      const withSlash = `${prefix}/`
      if (fullName.startsWith(withSlash)) {
        return fullName.slice(withSlash.length)
      }
      return fullName
    },
    joinRegistryPrefix (prefix, suffix) {
      const s = (suffix || '').replace(/^\/+/, '')
      if (!prefix) return s
      if (!s) return prefix
      if (s === prefix || s.startsWith(`${prefix}/`)) return s
      return `${prefix}/${s}`
    },
    applyPendingImageName () {
      if (!this.pendingFullImageName || !this.form.registry_id) return
      const shortName = this.stripRegistryPrefix(this.pendingFullImageName, this.registryHostPrefix)
      this.form.image_name = shortName || undefined
      this.pendingFullImageName = ''
    },
    filterOption (input, option) {
      const label = option.componentOptions?.propsData?.label || ''
      return label.toLowerCase().indexOf((input || '').toLowerCase()) >= 0
    },
    onSourceChange (e) {
      this.source = e.target.value
      this.handleSourceChange()
    },
    handleSourceChange () {
      this.form.registry_id = undefined
      this.form.image_name = undefined
      this.form.image_label = undefined
      this.form.credential_id = undefined
      this.imageOptions = []
      this.tagOptions = []
      this.pendingFullImageName = ''
      if (this.source === 'registry' && this.registries.length === 0) {
        this.fetchRegistries()
      }
    },
    addEnv () {
      this.envList.push({ id: uuid(), key: '', value: '' })
    },
    removeEnv (idx) {
      this.envList.splice(idx, 1)
    },
    async fetchRegistries () {
      try {
        this.registryLoading = true
        const manager = new this.$Manager('container_registries', 'v1')
        const result = await manager.list({
          params: {
            details: true,
            limit: 100,
            scope: this.$store.getters.scope,
            $t: uuid(),
          },
        })
        this.registries = (result.data.data || []).map(item => ({
          id: item.id,
          name: item.name,
          url: item.url,
          type: item.type,
          credential_id: item.credential_id,
        }))
      } catch (error) {
        throw error
      } finally {
        this.registryLoading = false
      }
    },
    handleRegistryChange (id) {
      this.form.image_name = undefined
      this.form.image_label = undefined
      this.imageOptions = []
      this.tagOptions = []
      this.pendingFullImageName = ''
      if (!id) return
      const reg = this.registries.find(r => r.id === id)
      if (reg?.type === 'custom') {
        return
      }
      this.fetchImages(id)
    },
    handleImageNameChange (name) {
      this.form.image_label = undefined
      this.tagOptions = []
      if (name && this.form.registry_id) {
        this.fetchTags(this.form.registry_id, name)
      }
    },
    async fetchImages (registryId, keepExisting = false) {
      try {
        this.imageLoading = true
        if (!keepExisting) {
          this.form.image_name = undefined
          this.form.image_label = undefined
        }
        this.imageOptions = []
        this.tagOptions = []
        const manager = new this.$Manager('container_registries', 'v1')
        const result = await manager.getSpecific({
          id: registryId,
          spec: 'images',
          params: { $t: uuid() },
        })
        const dataArr = result.data.repositories || []
        this.imageOptions = dataArr.map(item => {
          const parts = item.split('/')
          const v = parts.length > 1 ? parts[parts.length - 1] : item
          return { label: v, value: v, full: item }
        })
        if (keepExisting && this.form.image_name) {
          await this.fetchTags(registryId, this.form.image_name, true)
        } else if (this.imageOptions.length > 0) {
          this.form.image_name = this.imageOptions[0].value
          await this.fetchTags(registryId, this.form.image_name)
        }
      } catch (error) {
        throw error
      } finally {
        this.imageLoading = false
      }
    },
    async fetchTags (registryId, imageName, keepExisting = false) {
      try {
        this.tagLoading = true
        if (!keepExisting) {
          this.form.image_label = undefined
        }
        this.tagOptions = []
        const manager = new this.$Manager('container_registries', 'v1')
        const result = await manager.getSpecific({
          id: registryId,
          spec: 'image-tags',
          params: { repository: imageName, $t: uuid() },
        })
        const dataArr = result.data.tags || []
        this.tagOptions = dataArr.map(item => ({ label: item, value: item }))
        if (!keepExisting && this.tagOptions.length > 0) {
          this.form.image_label = this.tagOptions[0].value
        }
      } catch (error) {
        throw error
      } finally {
        this.tagLoading = false
      }
    },
    buildPayload () {
      let imageName = this.form.image_name
      if (this.source === 'registry') {
        imageName = this.joinRegistryPrefix(this.registryHostPrefix, this.form.image_name)
      }
      const data = {
        name: this.form.name,
        image_name: imageName,
        image_label: this.form.image_label,
      }
      if (this.source === 'registry') {
        data.registry_id = this.form.registry_id
        const credId = this.form.credential_id || this.selectedRegistry?.credential_id
        if (credId) data.credential_id = credId
      } else {
        if (this.type === 'edit') {
          data.registry_id = ''
        }
        if (this.form.credential_id) {
          data.credential_id = this.form.credential_id
        } else if (this.type === 'edit') {
          data.credential_id = ''
        }
      }
      const command = (this.form.command || '').trim()
      const args = (this.form.args || '').trim()
      if (command) {
        data.command = command.split(/\s+/)
      } else if (this.type === 'edit') {
        data.command = []
      }
      if (args) {
        data.args = args.split(/\s+/)
      } else if (this.type === 'edit') {
        data.args = []
      }
      const envs = (this.envList || [])
        .filter(item => (item.key || '').trim())
        .map(item => ({ key: item.key.trim(), value: item.value || '' }))
      if (envs.length > 0 || this.type === 'edit') {
        data.envs = envs
      }
      return data
    },
    async handleConfirm () {
      try {
        this.loading = true
        await validateModelForm(this.$refs.form)
        const data = this.buildPayload()
        if (this.type === 'edit') {
          await this.params.onManager('update', {
            id: this.params.data[0].id,
            managerArgs: { data },
          })
        } else {
          await this.params.onManager('create', {
            managerArgs: { data },
          })
        }
        this.cancelDialog()
        this.params.refresh && this.params.refresh()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
