<template>
  <div class="os-image-select-wrapper">
    <a-row :gutter="8">
      <a-col :span="8" v-if="showCloudaccount">
        <a-form-item :wrapperCol="{ span: 24 }" class="mb-0">
          <base-select
            v-decorator="decorator.prefer_manager"
            resource="cloudproviders"
            @change="cloudproviderChange"
            :params="cloudproviderParams"
            :isDefaultSelect="true"
            :resList.sync="cloudproviderList"
            :select-props="{ placeholder: $t('compute.text_149'), disabled: imageCloudproviderDisabled }" />
        </a-form-item>
      </a-col>
      <a-col :span="showCloudaccount ? 5 : 6">
        <a-form-item :wrapperCol="{ span: 24 }" class="mb-0">
          <a-select v-decorator="decorator.os" :loading="loading" @change="osChange" :placeholder="$t('compute.text_153')">
            <a-select-option v-for="item in imagesInfo.osOpts" :key="item.key">
              <div :key="item.key" class="d-flex align-items-center">
                <image-icon v-show="item.key !== 'all'" :image="item.key" />
                <span :class="{ 'ml-2': item.key !== 'all' }">{{ item.label }}</span>
              </div>
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="showCloudaccount ? 11 : 18">
        <a-form-item :wrapperCol="{ span: 24 }" class="mb-0">
          <image-select-template v-decorator="decorator.image" :imageOpts="imageOptions" @imageChange="imageChange" :loading="loading" :imageType="imageType" />
        </a-form-item>
      </a-col>
    </a-row>
    <span v-if="isShowErrorInfo" class="error-color">{{$t('compute.text_150')}}</span>
  </div>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
import { SELECT_IMAGE_KEY_SUFFIX } from '@Compute/constants'
import { Manager } from '@/utils/manager'
import { HYPERVISORS_MAP } from '@/constants'
import { IMAGES_TYPE_MAP, OS_TYPE_OPTION_MAP } from '@/constants/compute'
import storage from '@/utils/storage'
import { uuid } from '@/utils/utils'
import ImageSelectTemplate from './ImageSelectTemplate'

const initData = undefined

export default {
  name: 'ImageSelect',
  components: {
    ImageSelectTemplate,
  },
  props: {
    imageType: {
      type: String,
      required: true,
      validator: val => !R.isNil(IMAGES_TYPE_MAP[val]),
    },
    cloudType: {
      type: String,
      default: 'idc',
      validator: val => ['public', 'private', 'idc', 'baremetal'].includes(val),
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
    osArch: {
      type: String,
    },
    uefi: {
      type: Boolean,
    },
    vgaPci: {
      type: Boolean,
    },
    cloudproviderParamsExtra: {
      type: Object,
      default: () => ({}),
    },
    imageCloudproviderDisabled: {
      type: Boolean,
      default: false,
    },
    sysDiskSize: {
      type: Number,
    },
    edit: {
      type: Boolean,
      default: false,
    },
    hypervisor: {
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
        instanceBackupsList: [], // 主机备份 list
      },
      imagesInfo: {
        osOpts: [],
        imageOptsMap: {},
      },
      loading: false,
      imageOpts: [],
      cloudprovider: _.get(this.decorator, 'prefer_manager[1].initialValue') || '',
      cloudproviderList: [],
    }
  },
  computed: {
    apiCacheImgParams () {
      return IMAGES_TYPE_MAP[this.imageType].cacheImgParams || {}
    },
    apiImgParams () {
      return IMAGES_TYPE_MAP[this.imageType].imgParams || {}
    },
    isPublic () {
      return this.cloudType === 'public'
    },
    isPrivate () {
      return this.cloudType === 'private'
    },
    // 选择的镜像类型是否为公有云镜像
    isPublicImage () {
      return this.imageType === IMAGES_TYPE_MAP.public.key || this.imageType === IMAGES_TYPE_MAP.public_customize.key
    },
    // 选择的镜像类型是否为私有云镜像
    isPrivateImage () {
      return this.imageType === IMAGES_TYPE_MAP.private.key || this.imageType === IMAGES_TYPE_MAP.private_iso.key
    },
    isVMwareImage () {
      return this.imageType === IMAGES_TYPE_MAP.vmware.key
    },
    // 选择的镜像类型是否为主机镜像
    isHostImage () {
      return this.imageType === IMAGES_TYPE_MAP.host.key
    },
    // 选择的镜像类型是否为主机快照
    isShapshotImage () {
      return this.imageType === IMAGES_TYPE_MAP.snapshot.key
    },
    // 选择的镜像类型是否为主机备份
    isBackupImage () {
      return this.imageType === IMAGES_TYPE_MAP.backup.key
    },
    cacheimageIds () {
      return this.images.cacheimagesList.map(item => item.id)
    },
    storageSelectImage () { // public__select_image: {os: OS_TYPE_OPTION_MAP.Windows.value, image: {id: xxx, name: xxx}}
      return storage.get(`${this.cloudType}${SELECT_IMAGE_KEY_SUFFIX}`)
    },
    showCloudaccount () {
      if (!this.decorator.prefer_manager) return false
      const imageMsg = IMAGES_TYPE_MAP[this.imageType]
      return imageMsg && imageMsg.enable_cloudaccount
    },
    cloudproviderParams () {
      const params = {
        limit: 0,
        enabled: true,
        'filter.0': 'status.equals("connected")',
        'filter.1': 'health_status.equals("normal")',
        ...this.cloudproviderParamsExtra,
      }
      if (!params.scope && !params.project_domain) {
        params.scope = this.$store.getters.scope
      }
      if (this.showCloudaccount && this.form.fd.zone) {
        params.zone_id = this.form.fd.zone.key
      }
      return params
    },
    storageImage () {
      const initImageOs = this.decorator.os[1].initialValue
      const initImage = this.decorator.image[1].initialValue
      if (initImageOs && initImage) {
        return {
          os: initImageOs,
          image: initImage,
        }
      }
      if (this.storageSelectImage) {
        const [os, image] = this.storageSelectImage.split(':')
        if (os && image) {
          return {
            os,
            image,
          }
        }
      }
      return false
    },
    imageOptions () {
      const { os } = this.form.fc.getFieldsValue(['os'])
      let imageOptions = this.imageOpts
      // 所选镜像容量最小磁盘要求需小于虚拟机系统盘大小
      if (this.sysDiskSize) {
        imageOptions = this.imageOpts.filter((item) => {
          const minDisk = item.min_disk || (item.info && item.info.min_disk)
          if (minDisk) {
            return minDisk <= this.sysDiskSize
          }
          return true
        })
      }
      if (this.uefi) {
        const imageOpts = imageOptions.map((item) => {
          if (!item.properties?.uefi_support || item.properties?.uefi_support === 'false') {
            return {
              ...item,
              hidden: true,
            }
          }
          return item
        })
        const arr = imageOpts.filter((item) => { return !item.hidden })
        if (arr.length === 0 && os === OS_TYPE_OPTION_MAP.Windows.value) {
          this.form.fc.setFieldsValue({ [this.decorator.image[0]]: initData })
        }
        return imageOpts
      }
      return imageOptions
    },
    isVMware () {
      return this.imageType === IMAGES_TYPE_MAP.vmware.key
    },
    isShowErrorInfo () {
      return this.vgaPci
    },
    isCloudpods () {
      return this.hypervisor === HYPERVISORS_MAP.cloudpods.key
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
    showCloudaccount (val) {
      if (!val) { // 如果不显示云账号，清空 fd 中的 prefer_manager
        if (this.form && this.form.fd && this.form.fd.prefer_manager) {
          this.form.fd.prefer_manager = ''
        }
      } else { // 如果显示查看是否有初始化云订阅，如果有则请求 cacheImage-list
        this.$nextTick(() => {
          const { prefer_manager: preferManager } = this.form.fc.getFieldsValue([this.decorator.prefer_manager[0]])
          this.cloudproviderChange(preferManager)
        })
      }
    },
    'form.fd.vmem' (val) {
      if (this.imagesInfo.osOpts && this.imagesInfo.osOpts.length) {
        const { os, image } = this.form.fc.getFieldsValue([this.decorator.os[0], this.decorator.image[0]])
        this.defaultSelect(os, image)
      }
    },
    cloudproviderList (val) {
      if (this.showCloudaccount && (!val || !val.length)) {
        this.images.cacheimagesList = []
        this.getImagesInfo()
      }
    },
    osArch (val, oldVal) {
      if (R.equals(val, oldVal)) return
      this.getImagesInfo()
    },
    vgaPci (val, oldVal) {
      if (R.equals(val, oldVal)) return
      this.getImagesInfo()
    },
  },
  created () {
    this.imagesM = new Manager('images', 'v1')
    this.cachedimagesM = new Manager('cachedimages', 'v2')
    this.guestimagesM = new Manager('guestimages', 'v1')
    this.instanceSnapshots = new Manager('instance_snapshots', 'v2')
    this.instanceBackups = new Manager('instancebackups', 'v2')
    this.fetchData()
    this.fetchCacheimages = _.debounce(this._fetchCacheimages, 500)
    if (this.isPublicImage || this.isPrivateImage || this.isVMware) {
      this.fetchCacheimages()
    }
  },
  methods: {
    fetchData () {
      this.images.list = []
      let params = {}
      switch (this.imageType) { // 自定义镜像
        case IMAGES_TYPE_MAP.host.key: // 主机镜像
          // eslint-disable-next-line no-case-declarations
          params = { ...this.imageParams, status: 'active' }
          this.fetchHostImages(params)
          break
        case IMAGES_TYPE_MAP.snapshot.key: // 主机快照
          params = { ...this.imageParams, status: 'ready', provider: this.cloudproviderParamsExtra?.provider }
          this.fetchSnapshotImages(params)
          break
        case IMAGES_TYPE_MAP.backup.key: // 主机备份
          params = { ...this.imageParams, status: 'ready', provider: this.cloudproviderParamsExtra?.provider }
          this.fetchBackupImages(params)
          break
        default: // image list
          this.fetchImages()
          break
      }
    },
    imageChange (imageObj) {
      let imageMsg = {}
      if (imageObj && R.is(Object, imageObj)) {
        const list = this.imageOptions
        imageMsg = list.find(image => image.id === imageObj.key)
      }
      this.$emit('updateImageMsg', { imageMsg })
    },
    osChange (osValue, imageValue) {
      this.defaultSelect(osValue, imageValue)
    },
    _resetImage () {
      const { os, image } = this.form.fc.getFieldsValue(['os', 'image'])
      if (os && image) {
        this.form.fc.setFieldsValue({ os: undefined })
        this.form.fc.setFieldsValue({ image: initData })
      }
    },
    async fetchImages () {
      if (this.isPublicImage || this.isPrivateImage || this.isVMware) return // 阻止不必要的请求
      let params = {
        limit: 0,
        details: true,
        status: 'active',
        is_guest_image: false,
        scope: this.$store.getters.scope,
        ...this.imageParams,
      }
      if (params.project_domain) {
        delete params.scope
      }
      if (this.cloudType === 'baremetal') {
        params = {
          limit: 0,
          details: true,
          status: 'active',
          scope: this.$store.getters.scope,
          ...this.imageParams,
        }
      }
      if (this.imageType === IMAGES_TYPE_MAP.iso.key) {
        params.disk_formats = 'iso'
        if (params['filter.0'] && params['filter.0'] === 'disk_format.notequals(iso)') Reflect.deleteProperty(params, 'filter.0')
        Reflect.deleteProperty(params, 'is_standard')
      } else if (this.imageType === IMAGES_TYPE_MAP.standard.key || this.imageType === IMAGES_TYPE_MAP.customize.key || this.imageType === IMAGES_TYPE_MAP.host.key) {
        // Cloudpods 支持选择iso
        const target = (this.cloudproviderList || []).filter(item => item.id === this.cloudprovider)
        if (target.length && target[0].provider === 'Cloudpods') {
          if (params['filter.0'] && params['filter.0'] === 'disk_format.notequals(iso)') Reflect.deleteProperty(params, 'filter.0')
        } else {
          params['filter.0'] = 'disk_format.notequals(iso)'
        }
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
        if (this.cloudType === 'baremetal') {
          this.images.list = data.filter(item => { return item.properties && (item.properties.os_type === 'Linux' || item.properties.os_type === 'VMWare') })
        }
        this.getImagesInfo()
      } catch (error) {
        this.loading = false
        throw error
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
        throw error
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
        throw error
      }
    },
    async fetchBackupImages (params) {
      this.loading = true
      this._resetImage()
      try {
        const { data: { data = [] } } = await this.instanceBackups.list({ params })
        this.loading = false
        this.images.list = data
        this.getImagesInfo()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    async _fetchCacheimages () {
      if (R.isNil(this.cacheImageParams) || R.isEmpty(this.cacheImageParams)) return
      if (!this.isPublicImage && !this.isPrivateImage && !this.isVMware) return // 阻止不必要的请求，仅这三种情况需要渲染的是cacheimage，而且现在没有[需要标出哪些已缓存]的功能了
      const params = {
        details: false,
        order_by: 'ref_count',
        order: 'desc',
        $t: uuid(),
        valid: true,
        ...this.cacheImageParams,
      }
      if (this.showCloudaccount) {
        if (this.cloudprovider) {
          params.cloudprovider = this.cloudprovider
        } else {
          return
        }
      }
      if (this.imageType === IMAGES_TYPE_MAP.public.key) {
        params.image_type = 'system'
      }
      if (this.imageType === IMAGES_TYPE_MAP.public_customize.key) {
        params.image_type = 'customized'
      }
      if (this.isVMware) {
        params.image_type = 'system'
      }
      if ((this.isPrivate && !this.isCloudpods) || this.isVMware) {
        params.project_domain = this.form.fd.domain?.key || this.$store.getters.userInfo.projectDomainId
      }
      this.loading = true
      this.images.cacheimagesList = []
      try {
        const { data: { data = [] } } = await this.cachedimagesM.list({ params })
        this.loading = false
        this.images.cacheimagesList = data
        this.getImagesInfo()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    cloudproviderChange (val) {
      this.cloudprovider = val
      this.fetchCacheimages()
    },
    getProperties (img) {
      if (!img) return null
      if (this.isPublicImage || this.isPrivateImage || this.isVMwareImage) {
        return img.info?.properties
      }
      if (this.isShapshotImage || this.isBackupImage) {
        return img.server_metadata
      }
      return img.properties
    },
    getOsDistribution (osDistribution) {
      if (osDistribution.indexOf(OS_TYPE_OPTION_MAP.Windows.value) !== -1) {
        return OS_TYPE_OPTION_MAP.Windows.value
      }
      return osDistribution
    },
    genImageName (img) {
      let name = ''
      if (img.properties && img.properties.os_distribution) {
        name = img.properties.os_distribution
        if (img.properties.os_version) {
          name += ' ' + img.properties.os_version
        }
        if (img.properties.os_codename) {
          name += ' ' + img.properties.os_codename
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
      if (this.isPublicImage || this.isPrivateImage || this.isVMware) {
        images = this.images.cacheimagesList
        if (this.osArch) {
          images = images.filter((image) => {
            const arch = _.get(image, 'info.properties.os_arch', '')
            if (arch === this.osArch || arch.indexOf(this.osArch) >= 0) {
              return true
            }
            return false
          })
        }
      } else {
        if (this.vgaPci) {
          images = images.filter(item => {
            const osType = (item.properties?.os_type || '').toLowerCase()
            if (osType && osType.includes('windows')) {
              return item.properties?.uefi_support && item.properties?.uefi_support !== 'false'
            }
            return true
          })
        }
        if (this.imageType !== IMAGES_TYPE_MAP.host.key && this.imageType !== IMAGES_TYPE_MAP.snapshot.key && this.imageType !== IMAGES_TYPE_MAP.backup.key) {
          images = images.filter(item => {
            let diskFormat = item.disk_format
            if (!diskFormat && item.info && item.info.disk_format) {
              diskFormat = item.info.disk_format
            }
            return diskFormat && diskFormat !== 'docker'
          })
        }
      }
      let osOpts = [{ label: '全部', key: 'all' }]
      const imageOptsMap = {
        all: [],
      }
      let isOther = false
      for (let i = 0, len = images.length; i < len; i++) {
        const item = images[i]
        // 默认将 os 设置为 其他
        let osVal = 'other'
        let osLabel = ''
        // 如果有 os_type 标识则赋值给 osVal
        const properties = this.getProperties(item)
        if (properties && properties.os_distribution) {
          osVal = properties.os_distribution
        } else if (properties && properties.os_type) {
          osVal = properties.os_type
        } else {
          isOther = true
        }
        if (osVal.toLowerCase().includes('windows')) {
          osVal = OS_TYPE_OPTION_MAP.Windows.value
        }
        if (osVal.toLowerCase().includes('linux')) {
          if (osVal.toLowerCase().includes('amazon linux')) {
            osVal = 'Amazon Linux'
          } else if (osVal.includes('RedHat Enterprise Linux')) {
            osVal = 'RHEL'
          } else if (osVal.toLowerCase().includes('almalinux')) {
            osVal = 'AlmaLinux'
          } else if (osVal.toLowerCase().includes('rocky')) {
            osVal = 'Rocky'
          } else {
            osVal = 'Linux'
          }
        }
        if (osVal.toLowerCase().includes('ubuntu')) {
          osVal = 'Ubuntu'
        } else if (osVal.toLowerCase().includes('suse')) {
          osVal = 'SUSE'
        } else if (osVal.toLowerCase() === 'kylin') {
          osLabel = this.$t('compute.os.kylin')
          osVal = 'Kylin'
        } else if (osVal.toLowerCase() === 'neokylin') {
          osLabel = this.$t('compute.os.neokylin')
          osVal = 'NeoKylin'
        } else if (osVal.toLowerCase().includes('nfs')) {
          osLabel = this.$t('compute.os.nfs')
          osVal = 'nfs'
        }
        // const osDistribution = osVal && osVal.toLowerCase()
        const osDistribution = osVal
        // 如果 Map 中没有此 key，则创建，同时对options进行push
        if (!imageOptsMap[osDistribution]) {
          imageOptsMap[osDistribution] = []
          if (osVal !== 'other') {
            osOpts.push({
              label: osLabel || osVal,
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
        // !!! 暂时去掉镜像缓存功能，原因是镜像缓存在宿主机01上，但是可能调度到宿主机02上，那么该条镜像就不是已缓存
        // 选择的镜像类型为公有云/私有云平台的标准及自定义镜像才去做缓存标识
        // if ((this.isPublic && !this.isPublicImage) || (this.isPrivate && !this.isPrivateImage)) {
        //   newItem.feData.cached = this.getImageCached(item)
        // }
        imageOptsMap.all.push(newItem)
        imageOptsMap[osDistribution].push(newItem)
      }
      // make other os the last option
      if (isOther) {
        osOpts.push({ label: this.$t('compute.text_151'), key: 'other' })
      }
      osOpts = osOpts.filter((item) => {
        if (this.osType) {
          if (this.osType === OS_TYPE_OPTION_MAP.Windows.value) {
            return item.key === OS_TYPE_OPTION_MAP.Windows.value
          }
          return item.key !== OS_TYPE_OPTION_MAP.Windows.value
        }
        return true
      })
      this.imagesInfo = {
        osOpts,
        imageOptsMap,
      }
      this.fillImageOpts()
    },
    /*
     * @params {String} osValue
     * @params {Object} imageValue { key: <id>, label: <name> }
     */
    defaultSelect (osValue, imageValue) {
      this.imageOpts = []
      const { osOpts, imageOptsMap } = this.imagesInfo
      if (osOpts && osOpts.length) {
        let os = imageOptsMap[osValue] ? osValue : osOpts[0].key
        let imageOpts = this.getImageOpts(imageOptsMap[os])
        if (!imageOpts || !imageOpts.length) {
          this.form.fc.setFieldsValue({ image: initData })
        } else {
          const isEsxit = imageValue && !!imageOpts.find(val => val.id === imageValue.key)
          let image = isEsxit ? imageValue : { key: imageOpts[0].id, label: imageOpts[0].name }
          if (!this.edit && !osValue && this.storageImage) { // 采用上次选择的镜像（storage）
            const { os: storageOs, image: storageImage } = this.storageImage
            const tempImageOpts = imageOptsMap[storageOs] || []
            const storageImageObj = tempImageOpts.find(val => val.id === storageImage)
            if (R.is(Object, storageImageObj)) {
              imageOpts = this.getImageOpts(tempImageOpts)
              os = storageOs
              image = { key: storageImageObj.id, label: storageImageObj.name }
            }
          }
          this.imageOpts = imageOpts
          if (this.imageOptions.find(val => val.id === image.key)) {
            this.form.fc.setFieldsValue({ image })
          } else {
            this.form.fc.setFieldsValue({ image: initData })
          }
          const currentImage = this.form.fc.getFieldValue(this.decorator.image[0])
          if (currentImage && imageValue && currentImage.key === imageValue.key) {
          } else {
            this.imageChange(image)
          }
        }
        this.form.fc.setFieldsValue({ os })
      } else {
        this.form.fc.setFieldsValue({ os: undefined, image: initData })
      }
    },
    getImageOpts (imageOpts = []) {
      let images = imageOpts.slice()
      if (images && images.length > 0) {
        images = images.filter((item) => {
          const minRam = (item.info && item.info.min_ram) || item.min_ram
          if (this.form && this.form.fd) {
            const vmem = this.form.fd.vmem || this.form.fd.sku?.memory_size_mb
            if (minRam > 0 && R.is(Number, vmem)) {
              return minRam <= vmem
            }
          }
          return true
        })
      }
      if (images && images.length > 0) {
        images.sort((a, b) => {
          const aVersion = a.info && a.info.properties && a.info.properties.os_version
          const bVersion = b.info && b.info.properties && b.info.properties.os_version
          if (aVersion && bVersion) {
            return aVersion.localeCompare(bVersion)
          }
          return 0
        })
      }
      return images || []
    },
    fillImageOpts () {
      let lastSelectedImageInfo = storage.get('oc_selected_image') || {}
      // 默认值
      if (this.decorator.os[1].initialValue && this.decorator.image[1].initialValue) {
        lastSelectedImageInfo = { ...lastSelectedImageInfo, imageOs: this.decorator.os[1].initialValue, imageId: this.decorator.image[1].initialValue.key }
      }
      const { imageOs = lastSelectedImageInfo.imageOs, imageId = lastSelectedImageInfo.imageId } = this.$route.query

      if (imageOs) {
        const os = imageOs.replace(imageOs[0], imageOs[0].toUpperCase())
        const images = this.imagesInfo.imageOptsMap[os] || []
        if (images?.length > 0) {
          this.form.fc.setFieldsValue({ os })
        }
        let image = images.find((item) => { return item.id === imageId })
        this.defaultSelect(os === 'Nfs' ? 'nfs' : os)
        if (image) {
          image = { key: image.id, label: image.name }
          if (this.imageOptions.length === 0) {
            this.form.fc.setFieldsValue({ image: initData })
          } else {
            this.form.fc.setFieldsValue({ image })
          }
          this.imageChange(image)
        }
      } else {
        this.defaultSelect()
      }
    },
  },
}
</script>
