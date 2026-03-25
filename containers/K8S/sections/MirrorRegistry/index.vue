<template>
  <a-row :gutter="8">
    <a-col v-if="label" :span="24">
      <a-tag v-if="label.key">{{ label.key }}: {{ label.value }}</a-tag>
      <a-tag v-else>{{ label }}</a-tag>
    </a-col>
    <a-col :span="colSpan">
      <a-select
        :loading="registryLoading"
        :value="registry"
        optionLabelProp="label"
        @change="handleRegistryChange">
        <a-select-option value="" label="">{{ $t('common.tips.select', [$t('k8s.text_158')]) }}</a-select-option>
        <a-select-option
          v-for="cr in registrys"
          :key="cr.value"
          :value="cr.value"
          :label="cr.label">
          <div>{{ cr.label }}</div>
          <div style="font-size: 12px; color: #999;">{{ cr.url }}</div>
        </a-select-option>
      </a-select>
    </a-col>
    <template v-if="isCustomRegistry">
      <a-col :span="16">
        <a-input
          :value="customImageUrl"
          :placeholder="$t('k8s.repo.image.custom.placeholder')"
          @change="handleCustomImageUrlChange" />
        <div v-if="previewImage" style="font-size: 12px; color: #999; margin-top: 4px;">{{ previewImage }}</div>
      </a-col>
    </template>
    <template v-else>
      <a-col :span="colSpan">
        <a-select
          :loading="imageLoading"
          :value="image"
          @change="handleImageChange">
          <a-select-option value="">{{ $t('common.tips.select', [$t('k8s.text_42')]) }}</a-select-option>
          <a-select-option
            v-for="cr in images"
            :key="cr.value"
            :value="cr.value">{{ cr.label }}</a-select-option>
        </a-select>
      </a-col>
      <a-col :span="colSpan">
        <a-select
          :loading="tagLoading"
          :value="tag"
          @change="handleTagChange">
          <a-select-option value="">{{ $t('common.tips.select', [$t('k8s.repo.image.tag')]) }}</a-select-option>
          <a-select-option
            v-for="cr in tags"
            :key="cr.value"
            :value="cr.value">{{ cr.label }}</a-select-option>
        </a-select>
      </a-col>
    </template>
  </a-row>
</template>

<script>
import { uuid } from '@/utils/utils'

export default {
  name: 'MirrorRegistry',
  props: {
    isDefaultSelect: {
      type: Boolean,
      default: true,
    },
    label: {
      type: [String, Object],
    },
  },
  data () {
    return {
      registryLoading: false,
      registry: '',
      registrys: [],
      imageLoading: false,
      image: '',
      images: [],
      tagLoading: false,
      tag: '',
      tags: [],
      colSpan: 8,
      customImageUrl: '',
    }
  },
  computed: {
    isCustomRegistry () {
      const cur = this.registrys.find(o => o.value === this.registry)
      return cur?.type === 'custom'
    },
    previewImage () {
      const cur = this.registrys.find(o => o.value === this.registry)
      const url = cur?.url
      if (url && this.customImageUrl) {
        return `${this.stripProtocol(url)}/${this.customImageUrl}`
      }
      return ''
    },
  },
  watch: {
    registry (val) {
      if (!val) {
        this.$emit('change', '')
      }
    },
  },
  created () {
    this.getRegistrys()
  },
  methods: {
    handleRegistryChange (val) {
      if (val) {
        this.registry = val
        this.customImageUrl = ''
        const cur = this.registrys.find(o => o.value === val)
        this.$emit('credential-change', cur?.credential_id || '')
        if (cur?.type === 'custom') {
          this.image = ''
          this.images = []
          this.tag = ''
          this.tags = []
          this.$emit('change', '')
        } else {
          this.getImagesByRegistryId(val)
        }
      } else {
        this.registry = ''
        this.image = ''
        this.images = []
        this.tag = ''
        this.tags = []
        this.customImageUrl = ''
        this.$emit('change', '')
        this.$emit('credential-change', '')
      }
    },
    async getRegistrys () {
      try {
        const manager = new this.$Manager('container_registries')
        this.registryLoading = true
        this.registry = ''
        this.registrys = []
        const params = { details: true, limit: 20, offset: 0, scope: this.$store.getters.scope, $t: uuid() }
        const result = await manager.list({ params })
        const dataArr = result.data.data || []
        this.registrys = dataArr.map(item => {
          return {
            label: item.name,
            value: item.id,
            url: item.url,
            type: item.type,
            credential_id: item.credential_id,
          }
        })
        if (this.isDefaultSelect && this.registrys?.length > 0) {
          this.registry = this.registrys?.[0].value
          this.getImagesByRegistryId(this.registry)
        } else {
          this.image = ''
          this.tag = ''
        }
      } catch (error) {
        throw error
      } finally {
        this.registryLoading = false
      }
    },
    handleImageChange (val) {
      if (val) {
        this.image = val
        this.getTagsByImage(this.registry, val)
      } else {
        this.image = ''
        this.tag = ''
        this.$emit('change', '')
      }
    },
    async getImagesByRegistryId (rId) {
      try {
        const manager = new this.$Manager('container_registries')
        this.imageLoading = true
        this.image = ''
        this.images = []
        const result = await manager.getSpecific({ id: rId, spec: 'images', params: { $t: uuid() } })
        const dataArr = result.data.repositories || []
        this.images = dataArr.map(item => {
          const v = item.split('/')[1]
          return {
            label: v,
            value: v,
          }
        })
        if (this.images?.length > 0) {
          this.image = this.images?.[0].value
          this.getTagsByImage(rId, this.image)
        }
      } catch (error) {
        throw error
      } finally {
        this.imageLoading = false
      }
    },
    handleTagChange (val) {
      if (val) {
        this.tag = val
        this.triggerChange(this.registry, this.image, this.tag)
      } else {
        this.tag = ''
        this.$emit('change', '')
      }
    },
    async getTagsByImage (rId, image) {
      try {
        const manager = new this.$Manager('container_registries')
        this.tagLoading = true
        this.tag = ''
        this.tags = []
        const result = await manager.getSpecific({ id: rId, spec: 'image-tags', params: { repository: image, $t: uuid() } })
        const dataArr = result.data.tags || []
        this.tags = dataArr.map(item => {
          return {
            label: item,
            value: item,
          }
        })
        if (this.tags?.length > 0) {
          this.tag = this.tags?.[0].value
          this.triggerChange(this.registry, this.image, this.tag)
        }
      } catch (error) {
        throw error
      } finally {
        this.tagLoading = false
      }
    },
    stripProtocol (url) {
      return url.replace(/^https?:\/\//, '')
    },
    handleCustomImageUrlChange (e) {
      const val = e.target.value
      this.customImageUrl = val
      const curRegistry = this.registrys.find(o => o.value === this.registry)
      const url = curRegistry?.url
      if (url && val) {
        this.$emit('change', `${this.stripProtocol(url)}/${val}`)
      } else {
        this.$emit('change', '')
      }
    },
    triggerChange (registry, image, tag) {
      const curRegistry = this.registrys.find(o => o.value === registry)
      const url = curRegistry?.url
      if (url && image && tag) {
        this.$emit('change', `${this.stripProtocol(url)}/${image}:${tag}`)
      } else {
        this.$emit('change', '')
      }
    },
  },
}
</script>

<style>

</style>
