<template>
  <base-dialog :width="900" @cancel="cancelDialog">
    <div slot="header">{{ params.type === 'edit' ? $t('table.action.modify') : $t('common.create') }}</div>
    <div slot="body">
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-model-item :label="$t('common.name')" prop="name">
          <a-input v-model="form.name" :placeholder="$t('common.tips.input', [$t('common.name')])" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.llm_type')" prop="llm_type">
          <a-radio-group
            v-if="type !== 'edit'"
            v-model="form.llm_type"
            class="llm-type-picker"
            button-style="solid">
            <a-radio-button v-for="opt in llmTypeOptions" :key="opt.id" :value="opt.id">
              {{ opt.name }}
            </a-radio-button>
          </a-radio-group>
          <span v-else>{{ llmTypeName }}</span>
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.llm_image.image_source')" prop="image_source">
          <a-radio-group v-model="form.image_source" button-style="solid" @change="handleImageSourceChange">
            <a-radio-button value="container_image">{{ $t('dictionary.container_image') }}</a-radio-button>
            <a-radio-button value="manual">{{ $t('aice.llm_image.image_source.manual') }}</a-radio-button>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item
          v-if="form.image_source === 'container_image'"
          :label="$t('dictionary.container_image')"
          prop="container_image_id">
          <a-select
            v-model="form.container_image_id"
            show-search
            allow-clear
            :filter-option="filterContainerImageOption"
            :loading="containerImageLoading"
            :placeholder="$t('common.tips.select', [$t('dictionary.container_image')])">
            <a-select-option
              v-for="img in containerImages"
              :key="img.value"
              :value="img.value"
              :label="img.label">
              <div>{{ img.label }}</div>
              <div style="font-size: 12px; color: #999;">{{ img.ref }}</div>
            </a-select-option>
          </a-select>
          <div v-if="!containerImageLoading && containerImages.length === 0" class="mt-2">
            <a-alert type="info" show-icon>
              <template slot="message">
                {{ $t('aice.llm_image.container_image.empty_tip') }}
                <router-link to="/container_image">{{ $t('aice.llm_image.container_image.manage') }}</router-link>
              </template>
            </a-alert>
          </div>
        </a-form-model-item>
        <template v-else>
          <a-form-model-item :label="$t('aice.llm_image.name')" prop="image_name">
            <a-input v-model="form.image_name" :placeholder="$t('common.tips.input', [$t('aice.llm_image.name')])" />
          </a-form-model-item>
          <a-form-model-item :label="$t('aice.llm_image.label')" prop="image_label">
            <a-input v-model="form.image_label" :placeholder="$t('common.tips.input', [$t('aice.llm_image.label')])" />
          </a-form-model-item>
        </template>
        <a-form-model-item v-if="form.llm_type === 'desktop'" :label="$t('aice.llm_image.app_name')" prop="app_name">
          <a-input
            v-model="form.app_name"
            :placeholder="$t('common.tips.input', [$t('aice.llm_image.app_name')])" />
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
import { getAllowedImageLlmTypes, parseLlmImageRoute } from '@Ai/utils/llmRouteContext'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { validateModelForm } from '@/utils/validate'
import { LLM_TYPE_OPTIONS } from '../../llm-sku/constants/llmTypeConfig'

export default {
  name: 'DesktopImageCreateDialog',
  components: {
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const data = this.params.type === 'edit' ? this.params.data[0] : {}
    const imageRouteCtx = parseLlmImageRoute(this.$route.path)
    const allowedTypes = getAllowedImageLlmTypes(this.$route.path)
    const filteredOptions = allowedTypes
      .map(id => LLM_TYPE_OPTIONS.find(opt => opt.id === id))
      .filter(Boolean)
    const fallbackLlmType = imageRouteCtx.isDesktopImageRoute
      ? 'desktop'
      : (imageRouteCtx.isAgentImageRoute ? 'hermes-agent' : 'vllm')
    const defaultLlmType = (filteredOptions[0] && filteredOptions[0].id) || allowedTypes[0] || fallbackLlmType
    // 新建默认选容器镜像；编辑按已有数据回显
    let imageSource = 'container_image'
    if (this.params.type === 'edit') {
      imageSource = (data.image_source === 'container_image' || data.container_image_id)
        ? 'container_image'
        : 'manual'
    }
    return {
      loading: false,
      type: this.params.type,
      containerImageLoading: false,
      containerImages: [],
      form: {
        name: data.name || undefined,
        llm_type: data.llm_type || defaultLlmType,
        image_source: imageSource,
        container_image_id: data.container_image_id || undefined,
        image_name: data.image_name || undefined,
        image_label: data.image_label || undefined,
        app_name: data.app_name || undefined,
      },
      rules: {
        name: [{ required: true, validator: this.$validate('imageName') }],
        llm_type: [{ required: true, message: this.$t('common.tips.select', [this.$t('aice.llm_type')]) }],
        image_source: [{ required: true, message: this.$t('common.tips.select', [this.$t('aice.llm_image.image_source')]) }],
        container_image_id: [{
          validator: (rule, value, callback) => {
            if (this.form.image_source === 'container_image' && !value) {
              return callback(new Error(this.$t('common.tips.select', [this.$t('dictionary.container_image')])))
            }
            return callback()
          },
        }],
        image_name: [{
          validator: (rule, value, callback) => {
            if (this.form.image_source === 'manual' && !value) {
              return callback(new Error(this.$t('common.tips.input', [this.$t('aice.llm_image.name')])))
            }
            return callback()
          },
        }],
        image_label: [{
          validator: (rule, value, callback) => {
            if (this.form.image_source === 'manual' && !value) {
              return callback(new Error(this.$t('common.tips.input', [this.$t('aice.llm_image.label')])))
            }
            return callback()
          },
        }],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 5,
        },
      },
    }
  },
  computed: {
    llmTypeOptions () {
      const allowedTypes = getAllowedImageLlmTypes(this.$route.path)
      return allowedTypes
        .map(id => LLM_TYPE_OPTIONS.find(opt => opt.id === id))
        .filter(Boolean)
        .map(opt => ({ id: opt.id, name: this.$t(opt.name) }))
    },
    llmTypeName () {
      const opt = this.llmTypeOptions.find(o => o.id === this.form.llm_type)
      return opt ? this.$t(opt.name) : this.form.llm_type || '-'
    },
  },
  mounted () {
    if (this.form.image_source === 'container_image') {
      this.fetchContainerImages().catch(() => {})
    }
  },
  methods: {
    filterContainerImageOption (input, option) {
      const label = option.componentOptions?.propsData?.label || ''
      return label.toLowerCase().indexOf((input || '').toLowerCase()) >= 0
    },
    handleImageSourceChange () {
      if (this.form.image_source === 'container_image') {
        if (!this.containerImages.length && !this.containerImageLoading) {
          this.fetchContainerImages().catch(() => {})
        }
      } else {
        this.form.container_image_id = undefined
      }
    },
    async fetchContainerImages () {
      try {
        this.containerImageLoading = true
        const manager = new this.$Manager('container_images', 'v1')
        const result = await manager.list({
          params: {
            details: true,
            limit: 100,
            scope: this.$store.getters.scope,
          },
        })
        const dataArr = result.data.data || []
        this.containerImages = dataArr.map(item => ({
          label: item.name || `${item.image_name}:${item.image_label}`,
          value: item.id,
          ref: `${item.image_name}:${item.image_label}`,
        }))
      } catch (error) {
        throw error
      } finally {
        this.containerImageLoading = false
      }
    },
    buildSubmitData () {
      const data = {
        name: this.form.name,
        llm_type: this.form.llm_type,
        image_source: this.form.image_source,
      }
      if (this.form.llm_type === 'desktop' && this.form.app_name) {
        data.app_name = this.form.app_name
      }
      if (this.form.image_source === 'container_image') {
        data.container_image_id = this.form.container_image_id
      } else {
        data.image_name = this.form.image_name
        data.image_label = this.form.image_label
        data.container_image_id = ''
      }
      return data
    },
    async handleConfirm () {
      try {
        await validateModelForm(this.$refs.form)
        const data = this.buildSubmitData()
        if (this.type === 'edit') {
          await this.params.onManager('update', {
            id: this.params.data[0].id,
            managerArgs: {
              data,
            },
          })
        } else {
          await this.params.onManager('create', {
            managerArgs: {
              data,
            },
          })
        }
        this.loading = false
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
