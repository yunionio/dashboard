<template>
  <div>
    <a-form-item :label="$t('k8s.text_41')">
      <a-input :placeholder="$t('k8s.text_60')" v-decorator="decorators.name" />
    </a-form-item>
    <a-form-item :label="$t('k8s.repo.image.source')">
      <a-radio-group :value="source" @change="handleSourceChange">
        <a-radio-button value="custom">{{ $t('k8s.repo.image.custom') }}</a-radio-button>
        <a-radio-button value="registry">{{ $t('k8s.repo.image.registry') }}</a-radio-button>
        <a-radio-button value="container_image">{{ $t('k8s.repo.image.container_image') }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-if="source === 'custom'" :label="$t('k8s.text_97')">
      <a-input :placeholder="$t('k8s.text_98')" v-decorator="decorators.image" />
    </a-form-item>
    <a-form-item v-else-if="source === 'registry'" :label="$t('k8s.text_97')">
      <mirror-registry v-decorator="decorators.registryImage" />
    </a-form-item>
    <a-form-item v-else :label="$t('k8s.text_97')">
      <a-select
        v-decorator="decorators.containerImageId"
        showSearch
        :filterOption="filterOption"
        :loading="containerImageLoading"
        :placeholder="$t('common.tips.select', [$t('k8s.repo.image.container_image')])"
        @change="handleContainerImageChange"
        allowClear>
        <a-select-option
          v-for="img in containerImages"
          :key="img.value"
          :value="img.value"
          :label="img.label">
          <div>{{ img.label }}</div>
          <div style="font-size: 12px; color: #999;">{{ img.ref }}</div>
        </a-select-option>
      </a-select>
      <a-input v-show="false" v-decorator="decorators.image" />
      <div v-if="!containerImageLoading && containerImages.length === 0" class="mt-2">
        <a-alert type="info" show-icon>
          <template slot="message">
            {{ $t('k8s.repo.image.container_image.empty_tip') }}
            <router-link to="/container_image">{{ $t('k8s.repo.image.container_image.manage') }}</router-link>
          </template>
        </a-alert>
      </div>
    </a-form-item>
    <a-form-item label="CPU">
      <a-input :placeholder="$t('k8s.text_99')" type="number" v-decorator="decorators.cpu" :addonAfter="$t('k8s.text_100')" :min="1" @blur="e => formatInput(e, 'cpu')" />
    </a-form-item>
    <a-form-item :label="$t('k8s.text_101')">
      <a-input :placeholder="$t('k8s.text_102')" type="number" v-decorator="decorators.memory" addonAfter="G" :min="1" @blur="e => formatInput(e, 'memory')" />
    </a-form-item>
    <a-form-item :label="$t('k8s.text_103')">
      <a-input :placeholder="$t('k8s.text_104')" v-decorator="decorators.command" />
    </a-form-item>
    <a-form-item :label="$t('k8s.text_105')">
      <a-input :placeholder="$t('k8s.text_106')" v-decorator="decorators.arg" />
    </a-form-item>
    <a-form-item :label="$t('k8s.text_107')">
      <labels
        :decorators="decorators.volumeMount"
        :title="$t('k8s.text_10')"
        :keyLabel="$t('k8s.text_10')"
        :valueLabel="$t('k8s.text_108')"
        :keyPlaceholder="$t('k8s.text_109')"
        :valuePlaceholder="$t('k8s.text_110')"
        :keyBaseSelectProps="keyBaseSelectProps" />
    </a-form-item>
    <a-form-item :label="$t('k8s.text_111')">
      <labels :decorators="decorators.env" :title="$t('k8s.text_112')" :keyLabel="$t('k8s.text_112')" />
    </a-form-item>
    <a-form-item label="">
      <a-checkbox v-decorator="decorators.privileged">{{$t('k8s.text_113')}}</a-checkbox>
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import Labels from '@K8S/sections/Labels'
import MirrorRegistry from '@K8S/sections/MirrorRegistry'

export default {
  name: 'K8SSpecContainerForm',
  components: {
    Labels,
    MirrorRegistry,
  },
  props: {
    decorators: {
      type: Object,
      required: true,
    },
    cluster: String,
    namespace: String,
    form: {
      tpye: Object,
      validator: val => val.fc,
    },
  },
  data () {
    return {
      source: 'custom', // custom | registry | container_image
      containerImageLoading: false,
      containerImages: [],
    }
  },
  computed: {
    keyBaseSelectProps () {
      const params = {}
      if (this.cluster) {
        params.scope = this.$store.getters.scope
        params.unused = true
        params.cluster = this.cluster
        if (this.namespace) params.namespace = this.namespace
      }
      const props = {
        resource: 'persistentvolumeclaims',
        version: 'v1',
        params,
        needParams: true,
      }
      return props
    },
  },
  watch: {
    source (val) {
      if (val === 'container_image' && this.containerImages.length === 0) {
        this.fetchContainerImages()
      }
    },
  },
  methods: {
    filterOption (input, option) {
      const label = option.componentOptions?.propsData?.label || ''
      return label.toLowerCase().indexOf((input || '').toLowerCase()) >= 0
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
    handleContainerImageChange (id) {
      const img = this.containerImages.find(item => item.value === id)
      if (this.form && this.form.fc && this.decorators.image) {
        this.form.fc.setFieldsValue({
          [this.decorators.image[0]]: img ? img.ref : undefined,
        })
      }
    },
    formatInput (e, field) {
      if (this.form && this.form.fc) {
        const val = Number(e.target.value)
        if (R.is(Number, val) && !Number.isNaN(val) && val >= 0) {
        } else {
          this.form.fc.setFieldsValue({
            [this.decorators[field][0]]: 1, // 不合法直接设置为初始值 1
          })
        }
      }
    },
    handleSourceChange (e) {
      this.source = e.target.value
      if (this.form && this.form.fc) {
        const values = {}
        if (this.decorators.image) values[this.decorators.image[0]] = undefined
        if (this.decorators.registryImage) values[this.decorators.registryImage[0]] = undefined
        if (this.decorators.containerImageId) values[this.decorators.containerImageId[0]] = undefined
        this.form.fc.setFieldsValue(values)
      }
    },
  },
}
</script>
