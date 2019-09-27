<template>
  <div class="os-image-select-wrapper">
    <a-row :gutter="8">
      <a-col :span="8">
        <a-form-item>
          <a-select v-decorator="decorator.os" :loading="loading" @change="osChange">
            <a-select-option v-for="item in imagesInfo.osOpts" :key="item.key">
              <div :key="item.key" class="d-flex align-items-center">
                <image-icon :image="item.key" />
                <span class="ml-2">{{ item.label }}</span>
              </div>
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="16">
        <a-form-item>
          <a-select label-in-value v-decorator="decorator.image" :loading="loading" @change="imageChange" allow-clear>
            <a-select-option v-for="item in imageOpts" :key="item.id">{{ item.name }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import * as R from 'ramda'
import { Manager } from '@/utils/manager'
import { IMAGES_TYPE_MAP } from '@/constants/compute'

const initData = {
  key: '',
  label: '',
}

export default {
  name: 'ImageSelect',
  props: {
    imageType: {
      type: String,
      required: true,
      validator: val => [IMAGES_TYPE_MAP.standard.key, IMAGES_TYPE_MAP.customize.key].includes(val),
    },
    cloudType: {
      type: String,
      default: 'idc',
      validator: val => ['public', 'private', 'idc'].includes(val),
    },
    decorator: {
      type: Object,
      required: true,
      validator: val => R.is(Array, val.os) && R.is(Array, val.image),
    },
    imageParams: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      images: {
        list: [],
        cacheimagesList: [],
      },
      loading: false,
      imageOpts: [],
    }
  },
  inject: ['form'],
  computed: {
    // 选择的镜像类型是否为公有云镜像
    isPublicImage () {
      return this.imageType === IMAGES_TYPE_MAP.public.key || this.imageType === IMAGES_TYPE_MAP.publicCustomize.key
    },
    // 选择的镜像类型是否为私有云镜像
    isPrivateImage () {
      return this.imageType === IMAGES_TYPE_MAP.private.key
    },
    cacheimageIds () {
      return this.images.cacheimagesList.map(item => item.id)
    },
    imagesInfo () {
      let images = this.images.list
      // 如果选择的是公有云镜像类型，则取cache image list
      // 其他类型再进行过滤一次
      if (this.isPublicImage || this.isPrivateImage) {
        images = this.images.cacheimagesList
      } else {
        images = images.filter(item => item.disk_format && item.disk_format !== 'docker')
      }
      const osOpts = []
      const imageOptsMap = {}
      let isOther = false
      for (let i = 0, len = images.length; i < len; i++) {
        const item = images[i]
        // 默认将 os 设置为 其他
        let osVal = 'other'
        // 如果有 os_type 标识则赋值给 osVal
        const properties = this.getProperties(item)
        if (properties && properties.os_distribution) {
          osVal = properties.os_distribution
        } else {
          isOther = true
        }
        if (osVal.includes('Windows')) {
          osVal = 'Windows'
        }
        // const osDistribution = osVal && osVal.toLowerCase()
        const osDistribution = osVal
        // 如果 Map 中没有此 key，则创建，同时对options进行push
        if (!imageOptsMap[osDistribution]) {
          imageOptsMap[osDistribution] = []
          if (osVal !== 'other') {
            osOpts.push({
              label: osVal,
              key: osVal,
            })
          }
        }
        const newItem = {
          ...item,
          feData: {
            name: this.genImageName(item),
            imageType: this.getImageType(item),
          },
        }
        // 选择的镜像类型为公有云/私有云平台的标准及自定义镜像才去做缓存标识
        if ((this.isPublic && !this.isPublicImage) || (this.isPrivate && !this.isPrivateImage)) {
          newItem.feData.cached = this.getImageCached(item)
        }
        imageOptsMap[osDistribution].push(newItem)
      }
      // make other os the last option
      if (isOther) {
        osOpts.push({ label: '其他', key: 'other' })
      }
      return {
        osOpts,
        imageOptsMap,
      }
    },
  },
  watch: {
    imageParams () {
      this.fetchImages()
    },
  },
  created () {
    this.imagesM = new Manager('images', 'v1')
    this.fetchImages()
  },
  methods: {
    imageChange (imageObj) {
      let imageMsg = {}
      if (imageObj && R.is(Object, imageObj)) {
        imageMsg = this.images.list.find(image => image.id === imageObj.key)
      }
      this.$bus.$emit('updateFi', { imageMsg }) // 📢将当前 image 的详细信息广播出去
    },
    osChange (osValue) {
      this.defaultSelect(osValue)
    },
    fetchImages () {
      this.loading = true
      const { os, image } = this.form.fc.getFieldsValue(['os', 'image'])
      if (os && image) {
        this.form.fc.setFieldsValue({ os: '' })
        this.form.fc.setFieldsValue({ image: { ...initData } })
      }
      this.imagesM.list({ params: this.imageParams })
        .then(({ data: { data = [] } }) => {
          this.loading = false
          this.images.list = data
          this.$nextTick(this.defaultSelect)// 默认选择下拉第一项
        })
        .catch(() => {
          this.loading = false
        })
    },
    getProperties (img) {
      if (this.isPublicImage || this.isPrivateImage) {
        return img.info.properties
      }
      return img.properties
    },
    getOsDistribution (osDistribution) {
      if (osDistribution.indexOf('Windows') !== -1) {
        return 'Windows'
      }
      return osDistribution
    },
    genImageName (img) {
      let name = ''
      if (img.properties && img.properties['os_distribution']) {
        name = img.properties['os_distribution']
        if (img.properties['os_version']) {
          name += ' ' + img.properties['os_version']
        }
        if (img.properties['os_codename']) {
          name += ' ' + img.properties['os_codename']
        }
        name += ' (' + img.name + ')'
      } else {
        name = img.name
      }
      return name
    },
    getImageType (img) {
      let imageType = null
      const properties = this.getProperties(img)
      if (properties) {
        if (properties.os_distribution) {
          imageType = this.getOsDistribution(properties.os_distribution)
        } else {
          imageType = properties.os_type
        }
      }
      return imageType
    },
    getImageCached (img) {
      return this.cacheimageIds.includes(img.id)
    },
    defaultSelect (osValue) {
      const { osOpts, imageOptsMap } = this.imagesInfo
      if (osOpts && osOpts.length) {
        const os = osValue || osOpts[0].key
        this.form.fc.setFieldsValue({ os })
        const imageOpts = imageOptsMap[os]
        this.imageOpts = imageOpts
        if (imageOpts && imageOpts.length) {
          const image = { key: imageOpts[0].id, label: imageOpts[0].name }
          this.imageChange(image)
          this.form.fc.setFieldsValue({ image })
        }
      }
    },
  },
}
</script>
