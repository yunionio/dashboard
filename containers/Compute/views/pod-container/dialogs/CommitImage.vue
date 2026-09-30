<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('compute.repo.image.save_image') }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('compute.container', [])" :count="params.data.length" :action="$t('compute.repo.image.save_image')" />
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
        <a-form-model-item :label="$t('compute.repo.image.source')">
          <a-radio-group v-model="source" @change="onSourceChange">
            <a-radio-button value="registry">{{ $t('compute.repo.image.registered') }}</a-radio-button>
            <a-radio-button value="external">{{ $t('compute.repo.image.external') }}</a-radio-button>
          </a-radio-group>
        </a-form-model-item>

        <a-form-model-item v-if="source === 'registry'" :label="$t('dictionary.container_registry')" prop="registry_id">
          <a-select
            v-model="form.registry_id"
            showSearch
            :filterOption="filterOption"
            :loading="registryLoading"
            :placeholder="$t('common.tips.select', [$t('dictionary.container_registry')])"
            allowClear>
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

        <template v-else>
          <a-form-model-item :label="$t('compute.repo.image.registry_url')" prop="url">
            <a-input v-model="form.url" :placeholder="$t('compute.repo.image.registry_url.example')" />
          </a-form-model-item>
          <a-form-model-item :label="$t('compute.repo.image.registry_username')">
            <a-input v-model="form.username" :placeholder="$t('common.tips.input', [$t('compute.repo.image.registry_username')])" />
          </a-form-model-item>
          <a-form-model-item :label="$t('compute.repo.image.registry_password')">
            <a-input-password v-model="form.password" :placeholder="$t('common.tips.input', [$t('compute.repo.image.registry_password')])" />
          </a-form-model-item>
        </template>

        <a-form-model-item :label="$t('compute.repo.image.name')" prop="image_name">
          <a-input v-model="form.image_name" :addonBefore="registryPrefixAddon" :placeholder="$t('common.tips.input', [$t('compute.repo.image.name')])" />
        </a-form-model-item>
        <a-form-model-item :label="$t('compute.repo.image.tag')">
          <a-input v-model="form.tag" :placeholder="$t('compute.repo.image.tag_tip')" />
          <div v-if="previewRepository" style="font-size: 12px; color: #999; margin-top: 4px;">{{ previewRepository }}</div>
        </a-form-model-item>
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" :loading="loading" @click="handleConfirm">{{ $t('dialog.ok') }}</a-button>
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
  name: 'ContainerCommitImageDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const container = this.params.data[0] || {}
    return {
      loading: false,
      registryLoading: false,
      // 仓库来源：registry 使用已注册仓库，external 使用外部仓库
      source: 'registry',
      registries: [],
      form: {
        registry_id: undefined,
        url: undefined,
        username: undefined,
        password: undefined,
        // 为空时后端默认使用容器名称
        image_name: container.name,
        // 为空时后端默认使用时间戳
        tag: undefined,
      },
      rules: {
        registry_id: [{
          validator: (rule, value, callback) => {
            if (this.source === 'registry' && !value) {
              callback(new Error(this.$t('common.tips.select', [this.$t('dictionary.container_registry')])))
            } else {
              callback()
            }
          },
        }],
        url: [{
          validator: (rule, value, callback) => {
            if (this.source === 'external' && !value) {
              callback(new Error(this.$t('common.tips.input', [this.$t('compute.repo.image.registry_url')])))
            } else {
              callback()
            }
          },
        }],
        image_name: [{ required: true, message: this.$t('common.tips.input', [this.$t('compute.repo.image.name')]) }],
      },
    }
  },
  computed: {
    selectedRegistry () {
      return this.registries.find(r => r.id === this.form.registry_id)
    },
    registryPrefix () {
      const url = this.source === 'external' ? this.form.url : this.selectedRegistry?.url
      return this.stripProtocol(url || '')
    },
    registryPrefixAddon () {
      return this.registryPrefix ? `${this.registryPrefix}/` : ''
    },
    previewRepository () {
      if (!this.form.image_name) return ''
      const tag = this.form.tag || this.$t('compute.repo.image.tag_tip')
      return `${this.registryPrefixAddon}${this.form.image_name}:${tag}`
    },
  },
  created () {
    this.fetchRegistries()
  },
  methods: {
    stripProtocol (url) {
      return (url || '').replace(/^https?:\/\//, '').replace(/\/+$/, '')
    },
    filterOption (input, option) {
      const label = option.componentOptions?.propsData?.label || ''
      return label.toLowerCase().indexOf((input || '').toLowerCase()) >= 0
    },
    onSourceChange () {
      this.$refs.form && this.$refs.form.clearValidate()
    },
    async fetchRegistries () {
      try {
        this.registryLoading = true
        const manager = new this.$Manager('container_registries', 'v1')
        const { data: { data = [] } } = await manager.list({
          params: {
            details: true,
            limit: 100,
            scope: this.$store.getters.scope,
            $t: uuid(),
          },
        })
        this.registries = data.map(item => ({
          id: item.id,
          name: item.name,
          url: item.url,
          type: item.type,
        }))
      } catch (error) {
        throw error
      } finally {
        this.registryLoading = false
      }
    },
    buildCommitInput () {
      const container = {
        image_name: this.form.image_name,
      }
      if (this.form.tag) {
        container.tag = this.form.tag
      }
      if (this.source === 'registry') {
        container.registry_id = this.form.registry_id
      } else {
        container.external_registry = {
          url: this.form.url,
          auth: {
            username: this.form.username,
            password: this.form.password,
          },
        }
      }
      return container
    },
    async handleConfirm () {
      try {
        this.loading = true
        await validateModelForm(this.$refs.form)
        const res = await this.params.onManager('performAction', {
          id: this.params.data[0].id,
          steadyStatus: ['running', 'exited'],
          managerArgs: {
            action: 'commit',
            data: this.buildCommitInput(),
          },
        })
        const repository = res?.data?.container?.repository
        if (repository) {
          this.$message.success(this.$t('compute.repo.image.commit_success', [repository]))
        }
        this.params.refresh && this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
