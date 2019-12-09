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
          <a-select label-in-value v-decorator="decorator.image" :loading="loading" @change="imageChange">
            <a-select-option v-for="item in imageOpts" :key="item.id">
              <div class="d-flex">
                <div class="flex-fill">{{ item.name }}</div>
                <div><a-tag v-show="item.feData.cached" color="green">已缓存</a-tag></div>
              </div>
            </a-select-option>
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
      validator: val => !R.isNil(IMAGES_TYPE_MAP[val]),
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
    },
    form: {
      type: Object,
      required: true,
      validator: val => !R.isNil(val.fc),
    },
    cacheImageParams: {
      type: Object,
    },
    osType: {
      type: String,
    },
  },
  data () {
    return {
      images: {
        list: [], // 公共镜像、iso、自定义镜像 list
        cacheimagesList: [], // idc: 镜像缓存list，用于对比哪些镜像已缓存，public|private: image-list
        hostimagesList: [], // 主机镜像 list
        instanceSnapshotsList: [], // 主机快照 list
      },
      imagesInfo: {
        osOpts: [],
        imageOptsMap: {},
      },
      loading: false,
      imageOpts: [],
    }
  },
  computed: {
    apiCacheImgParams () {
      return IMAGES_TYPE_MAP[this.imageType].cacheImgParams || {}
    },
    apiImgParams () {
      return IMAGES_TYPE_MAP[this.imageType].imgParams || {}
    },
    // 选择的镜像类型是否为公有云镜像
    isPublicImage () {
      return this.imageType === IMAGES_TYPE_MAP.public.key || this.imageType === IMAGES_TYPE_MAP.public_customize.key
    },
    // 选择的镜像类型是否为私有云镜像
    isPrivateImage () {
      return this.imageType === IMAGES_TYPE_MAP.private.key
    },
    // 选择的镜像类型是否为主机镜像
    isHostImage () {
      return this.imageType === IMAGES_TYPE_MAP.host.key
    },
    // 选择的镜像类型是否为主机快照
    isShapshotImage () {
      return this.imageType === IMAGES_TYPE_MAP.snapshot.key
    },
    cacheimageIds () {
      return this.images.cacheimagesList.map(item => item.id)
    },
  },
  watch: {
    imageType (val, oldVal) {
      if (R.equals(val, oldVal)) return
      this.fetchData()
      this.fetchCacheimages()
    },
    cacheImageParams (val, oldVal) {
      if (R.equals(val, oldVal)) return
      this.fetchCacheimages()
    },
    imageParams (val, oldVal) {
      if (R.equals(val, oldVal)) return
      this.fetchData()
    },
  },
  created () {
    this.imagesM = new Manager('images', 'v1')
    this.cachedimagesM = new Manager('cachedimages', 'v2')
    this.guestimagesM = new Manager('guestimages', 'v1')
    this.instanceSnapshots = new Manager('instance_snapshots', 'v2')
    this.fetchData()
    this.fetchCacheimages()
  },
  methods: {
    fetchData () {
      this.images.list = []
      switch (this.imageType) { // 自定义镜像
        case IMAGES_TYPE_MAP.host.key: // 主机镜像
          this.fetchHostImages(this.imageParams)
          break
        case IMAGES_TYPE_MAP.snapshot.key: // 主机快照
          this.fetchSnapshotImages(this.imageParams)
          break
        default: // image list
          this.fetchImages()
          break
      }
    },
    imageChange (imageObj) {
      let imageMsg = {}
      if (imageObj && R.is(Object, imageObj)) {
        let list = this.images.list
        if (this.isPublicImage || this.isPrivateImage) list = this.images.cacheimagesList
        imageMsg = list.find(image => image.id === imageObj.key)
      }
      this.$bus.$emit('VMInstanceCreateUpdateFi', { imageMsg }) // 📢将当前 image 的详细信息广播出去
    },
    osChange (osValue) {
      this.defaultSelect(osValue)
    },
    _resetImage () {
      const { os, image } = this.form.fc.getFieldsValue(['os', 'image'])
      if (os && image) {
        this.form.fc.setFieldsValue({ os: '' })
        this.form.fc.setFieldsValue({ image: { ...initData } })
      }
    },
    async fetchImages () {
      const params = {
        limit: 0,
        details: true,
        status: 'active',
        scope: this.$store.getters.scope,
        ...this.imageParams,
      }
      if (this.imageType === IMAGES_TYPE_MAP.iso.key) {
        params.disk_formats = 'iso'
      } else {
        params['filter.0'] = 'disk_format.notequals(iso)'
      }
      if (this.imageType === IMAGES_TYPE_MAP.customize.key) {
        params.owner = this.$store.getters.userInfo.projectId
        params.is_standard = false
      }
      if (this.imageType === IMAGES_TYPE_MAP.standard.key) {
        params.is_standard = true
      }
      this.loading = true
      this._resetImage()
      try {
        const { data: { data = [] } } = await this.imagesM.list({ params })
        this.loading = false
        this.images.list = data
        this.getImagesInfo()
      } catch (error) {
        this.loading = false
      }
    },
    async fetchHostImages (params) {
      this.loading = true
      this._resetImage()
      try {
        const { data: { data = [] } } = await this.guestimagesM.list({ params })
        this.loading = false
        this.images.list = data
        this.getImagesInfo()
      } catch (error) {
        this.loading = false
      }
    },
    async fetchSnapshotImages (params) {
      this.loading = true
      this._resetImage()
      try {
        const { data: { data = [] } } = await this.instanceSnapshots.list({ params })
        this.loading = false
        this.images.list = data
        this.getImagesInfo()
      } catch (error) {
        this.loading = false
      }
    },
    async fetchCacheimages () {
      this.images.cacheimagesList = []
      this.loading = true
      const params = {
        details: false,
        order_by: 'ref_count',
        order: 'desc',
        image_type: 'customized',
        ...this.cacheImageParams,
      }
      if (
        this.imageType === IMAGES_TYPE_MAP.public.key ||
        this.imageType === IMAGES_TYPE_MAP.private.key
      ) {
        params.image_type = 'system'
      }
      try {
        const { data: { data = [] } } = await this.cachedimagesM.list({ params })
        this.loading = false
        this.images.cacheimagesList = data
        if (this.isPublicImage || this.isPrivateImage) {
          this.getImagesInfo()
        }
      } catch (error) {
        this.loading = false
      }
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
    getImagesInfo () {
      let images = this.images.list
      // 如果选择的是公有云镜像类型，则取cache image list
      // 其他类型再进行过滤一次
      if (this.isPublicImage || this.isPrivateImage) {
        images = this.images.cacheimagesList
      } else {
        if (this.imageType !== IMAGES_TYPE_MAP.snapshot.key) {
          images = images.filter(item => item.disk_format && item.disk_format !== 'docker')
        }
      }
      let osOpts = []
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
        } else if (properties && properties.os_type) {
          osVal = properties.os_type
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
      osOpts = osOpts.filter((item) => {
        if (this.osType) {
          if (this.osType === 'Windows') {
            return item.key === 'Windows'
          }
          return item.key !== 'Windows'
        }
        return true
      })
      this.imagesInfo = {
        osOpts,
        imageOptsMap,
      }
      this.defaultSelect()
    },
    defaultSelect (osValue) {
      this.imageOpts = []
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
