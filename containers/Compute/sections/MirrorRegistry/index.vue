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
        @change="handleRegistryChange">
        <a-select-option value="">{{ $t('common.tips.select', [$t('compute.eci.repo.image.registry')]) }}</a-select-option>
        <a-select-option
          v-for="cr in registrys"
          :key="cr.value"
          :value="cr.value">{{ cr.label }}</a-select-option>
      </a-select>
    </a-col>
    <a-col :span="colSpan">
      <a-select
        :loading="imageLoading"
        :value="image"
        @change="handleImageChange">
        <a-select-option value="">{{ $t('common.tips.select', [$t('compute.pod-image')]) }}</a-select-option>
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
        <a-select-option value="">{{ $t('common.tips.select', [$t('compute.repo.image.tag')]) }}</a-select-option>
        <a-select-option
          v-for="cr in tags"
          :key="cr.value"
          :value="cr.value">{{ cr.label }}</a-select-option>
      </a-select>
    </a-col>
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
    }
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
        this.getImagesByRegistryId(val)
      } else {
        this.registry = ''
        this.image = ''
        this.images = []
        this.tag = ''
        this.tags = []
        this.$emit('change', '')
      }
    },
    async getRegistrys () {
      try {
        const manager = new this.$Manager('container_registries')
        this.registryLoading = true
        this.registry = ''
        this.registrys = []
        const params = { details: true, limit: 20, offset: 0, $t: uuid() }
        const result = await manager.list({ params })
        const dataArr = result.data.data || []
        this.registrys = dataArr.map(item => {
          return {
            label: item.name,
            value: item.id,
            url: item.url,
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
    triggerChange (registry, image, tag) {
      const curRegistry = this.registrys.find(o => o.value === registry)
      const url = curRegistry?.url
      if (url && image && tag) {
        this.$emit('change', `${url}/${image}:${tag}`)
      } else {
        this.$emit('change', '')
      }
    },
  },
}
</script>

<style>
</style>
