<template>
  <div class="image-select">
    <a-row v-if="isShowComponent">
      <a-radio-group v-model="imageType">
        <a-tooltip v-for="item in mirrorTypeOptions" :key="item.key" :title="item.tooltip" :mouseEnterDelay="0.5">
          <a-radio-button :value="item.key" :disabled="item.disabled">{{ item.label }}</a-radio-button>
        </a-tooltip>
      </a-radio-group>
    </a-row>
    <a-row :gutter="8" v-if="isShowComponent">
      <a-col :span="12">
        <a-select v-model="os" :loading="loading" :placeholder="$t('compute.text_153')">
          <a-select-option v-for="item in imagesInfo.osOpts" :key="item.key">
            <div :key="item.key" class="d-flex align-items-center">
              <image-icon :image="item.key" />
              <span class="ml-2">{{ item.label }}</span>
            </div>
          </a-select-option>
        </a-select>
      </a-col>
      <a-col :span="12">
        <a-select v-model="image" @change="change" :loading="loading" :filterOption="filterOption" :showSearch="true" option-filter-prop="children" :placeholder="$t('compute.text_214')" allowClear>
          <a-select-option v-for="(item, index) in imageOpts" :key="index" :value="item.id">
            <div :key="`${item.name} ${item.id}`">
              <a-row>
                <a-col :span="24">
                  <div>{{ item.name }}<a-icon type="safety-certificate" v-if="isEncryped(item)" :title="$t('common.text.encrption_enable')" /></div>
                </a-col>
              </a-row>
              <a-row>
                <a-col :span="16">
                  <div class="oc-selected-display-none text-color-secondary over-hidden" v-if="showExternalId && item.external_id">{{ $t('compute.text_1346') }}: {{ item.external_id }}</div>
                </a-col>
                <a-col :span="8" align="right">
                  <div class="oc-selected-display-none text-color-secondary" style="text-align: right;">
                    {{ imgLabels(item) }}
                  </div>
                </a-col>
              </a-row>
            </div>
          </a-select-option>
        </a-select>
      </a-col>
    </a-row>
    <div v-if="!isShowComponent">与主节点保持一致</div>
  </div>
</template>

<script>
import _ from 'lodash'
import * as R from 'ramda'
import { HYPERVISORS_MAP } from '@/constants'
import { IMAGES_TYPE_MAP, OS_TYPE_OPTION_MAP, HOST_CPU_ARCHS } from '@/constants/compute'
import { sizestr, uuid } from '@/utils/utils'
import mixin from '../mixin'

export default {
  name: 'JImageList',
  mixins: [mixin],
  data () {
    return {
      loading: false,
      imageType: '',
      os: '',
      image: '',
      images: {
        list: [],
        cacheimagesList: [],
      },
      imagesInfo: {
        osOpts: [],
        imageOpts: [],
      },
      imageOpts: [],
    }
  },
  computed: {
    isShowComponent () {
      return !this.$attrs.id.includes('slaveNode')
    },
    fd () {
      return this.formFd.fd
    },
    fe () {
      return this.formFd.fe
    },
    hypervisor () {
      return this.formFd.fd.hypervisor
    },
    isArm () {
      return this.fe.sku && this.fe.sku.cpu_arch === HOST_CPU_ARCHS.arm.capabilityKey
    },
    isLoongarch64 () {
      return this.fe.sku && this.fe.sku.cpu_arch === HOST_CPU_ARCHS.loongarch64.capabilityKey
    },
    isIDC () {
      return HYPERVISORS_MAP[this.hypervisor]?.env === 'idc'
    },
    isPrivate () {
      return HYPERVISORS_MAP[this.hypervisor]?.env === 'private'
    },
    isPublic () {
      return HYPERVISORS_MAP[this.hypervisor]?.env === 'public'
    },
    // 选择的镜像类型是否为公有云镜像
    isPublicImage () {
      return this.imageType === IMAGES_TYPE_MAP.public.key || this.imageType === IMAGES_TYPE_MAP.public_customize.key
    },
    // 选择的镜像类型是否为私有云镜像
    isPrivateImage () {
      return this.imageType === IMAGES_TYPE_MAP.private.key
    },
    isVMwareImage () {
      return this.imageType === IMAGES_TYPE_MAP.vmware.key
    },
    project_domain () {
      return this.extendFd.domain ? this.extendFd.domain.key : this.$store.getters.userInfo.projectDomainId
    },
    imageParams () {
      const params = {
        ...this.scopeParams.scopeParams,
      }
      if (this.isPrivate) {
        if (R.is(Object, this.formFd.fe.sku)) {
          const region = _.get(this.formFd.fd, 'preferRegion')
          if (region) {
            params.cloudregion_id = region
          }
        }
      }
      if (R.is(Object, this.formFd.fe.sku)) {
        params.os_arch = HOST_CPU_ARCHS.x86.key
        if (this.isArm) params.os_arch = HOST_CPU_ARCHS.arm.key
        if (this.isLoongarch64) params.os_arch = HOST_CPU_ARCHS.loongarch64.key
      }
      return params
    },
    cacheImageParams () {
      const params = {
        cloudregion_id: _.get(this.formFd.fd, 'preferRegion'),
      }
      if (!params.cloudregion_id) return {}
      if (this.imageType === 'vmware') {
        params.image_type = 'system'
      }
      if (this.isPrivate) {
        if (this.hypervisor !== HYPERVISORS_MAP.cloudpods.hypervisor) {
          params.project_domain = this.project_domain
        }
      }
      if (R.is(Object, this.formFd.fe.sku)) {
        params.os_arch = HOST_CPU_ARCHS.x86.key
        if (this.isArm) params.os_arch = HOST_CPU_ARCHS.arm.key
        if (this.isLoongarch64) params.os_arch = HOST_CPU_ARCHS.loongarch64.key
      }
      return params
    },
    cacheimageIds () {
      return this.images.cacheimagesList.map(item => item.id)
    },
    showExternalId () {
      const showExternalIdList = [IMAGES_TYPE_MAP.public.key, IMAGES_TYPE_MAP.public_customize.key]
      if (showExternalIdList.includes(this.imageType)) {
        return true
      }
      return false
    },
    mirrorTypeOptions () {
      let ret = [IMAGES_TYPE_MAP.standard, IMAGES_TYPE_MAP.customize]
      if (this.isIDC && this.hypervisor === HYPERVISORS_MAP.kvm.key) {
      } else if (this.hypervisor === HYPERVISORS_MAP.esxi.key) {
        ret.unshift(IMAGES_TYPE_MAP.vmware)
      } else if (this.hypervisor === HYPERVISORS_MAP.proxmox.key) {
        ret = [IMAGES_TYPE_MAP.private]
      } else if (this.isPublic) {
        ret.unshift(IMAGES_TYPE_MAP.public_customize)
        ret.unshift(IMAGES_TYPE_MAP.public)
      } else if (this.isPrivate) {
        ret.unshift(IMAGES_TYPE_MAP.private)
      }
      return ret
    },
  },
  watch: {
    'formFd.fd.hypervisor' () {
      this.fillImageType()
    },
    'formFd.fd.preferRegion' () {
      this.fetchData()
    },
    imageType () {
      this.fetchData()
    },
    'fe.sku' (val) {
      this.fetchData()
    },
    'formFd.fe.image.id' () {
      if (!this.isShowComponent) {
        this.image = this.formFd?.fe?.image?.id
        this.change(this.image, true)
      }
    },
  },
  created () {
    this.imagesM = new this.$Manager('images', 'v1')
    this.cachedimagesM = new this.$Manager('cachedimages', 'v2')
    this.fetchCacheimages = _.debounce(this._fetchCacheimages, 500)
  },
  methods: {
    change (...ret) {
      this.$emit('change', ...ret)
      if (this.isShowComponent) {
        const targets = this.imageOpts.filter(item => {
          if (this.image && item.id === this.image) {
            return true
          }
          return false
        })
        this.formFd.fe.image = targets[0] || {}
      }
    },
    fillImageType () {
      this.imageType = this.mirrorTypeOptions[0].key
    },
    fetchData () {
      if (!this.formFd.fd.hypervisor) return
      if (!this.imageType) return
      if (!this.isShowComponent) {
        this.change(this.formFd?.fe?.image?.id, true)
        return
      }
      if (this.isPublicImage || this.isPrivateImage || this.isVMware) {
        this.fetchCacheimages()
      } else {
        this.fetchImages()
      }
    },
    async fetchImages () {
      const params = {
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
      params['filter.0'] = 'disk_format.notequals(iso)'
      if (this.imageType === IMAGES_TYPE_MAP.customize.key) {
        params.owner = this.$store.getters.userInfo.projectId
        params.is_standard = false
      }
      if (this.imageType === IMAGES_TYPE_MAP.standard.key) {
        params.is_standard = true
      }
      this.loading = true
      // this._resetImage()
      try {
        const { data: { data = [] } } = await this.imagesM.list({ params })
        this.loading = false
        this.images.list = data
        this.getImagesInfo()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    async _fetchCacheimages () {
      const params = {
        details: false,
        order_by: 'ref_count',
        order: 'desc',
        $t: uuid(),
        valid: true,
        ...this.cacheImageParams,
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
      // if ((this.isPrivate && !this.isCloudpods) || this.isVMware) {
      //   params.project_domain = this.form.fd.domain?.key || this.$store.getters.userInfo.projectDomainId
      // }
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
    getProperties (img) {
      if (!img) return null
      if (this.isPublicImage || this.isPrivateImage || this.isVMwareImage) {
        return img.info?.properties
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
        if (this.uefi) {
          images = images.filter(item => item.properties?.uefi_support && item.properties?.uefi_support !== 'false')
        }
        if (this.imageType !== IMAGES_TYPE_MAP.snapshot.key) {
          images = images.filter(item => {
            let diskFormat = item.disk_format
            if (!diskFormat && item.info.disk_format) {
              diskFormat = item.info.disk_format
            }
            return diskFormat && diskFormat !== 'docker'
          })
        }
      }
      const osOpts = []
      let imageOpts = []
      // let isOther = false
      for (let i = 0, len = images.length; i < len; i++) {
        const item = images[i]
        // 默认将 os 设置为 其他
        let osVal = 'other'
        let osVersion = ''
        // 如果有 os_type 标识则赋值给 osVal
        const properties = this.getProperties(item)
        if (properties && properties.os_distribution) {
          osVal = properties.os_distribution
        } else if (properties && properties.os_type) {
          osVal = properties.os_type
        }
        if (properties && properties.os_version) {
          osVersion = properties.os_version
        }
        // const osDistribution = osVal && osVal.toLowerCase()
        const osDistribution = osVal
        // 如果 Map 中没有此 key，则创建，同时对options进行push
        // if (!imageOptsMap[osDistribution] && osDistribution === 'CentOS') {
        //   imageOptsMap[osDistribution] = []
        //   if (osVal !== 'other') {
        //     osOpts.push({
        //       label: osVal,
        //       key: osVal,
        //     })
        //   }
        // }
        const newItem = {
          ...item,
          feData: {
            name: this.genImageName(item),
            imageType: this.getImageType(item),
          },
        }
        if (osDistribution === 'CentOS' && osVersion.startsWith('7')) {
          if (!osOpts.length) {
            osOpts.push({
              label: osVal,
              key: osVal,
            })
          }
          imageOpts.push(newItem)
        }
      }
      // Azure 套餐和 centos镜像有匹配规则
      if (this.formFd?.fd?.hypervisor === 'azure' && this.fe?.sku?.id && this.os === 'CentOS') {
        imageOpts = imageOpts.filter(item => {
          if (this.centos_Generation1_ignore_sku_filters.some(reg => this.fe?.sku?.name.match(reg))) {
            return (item.info?.id || '').includes('gen2')
          }
          if (this.centos_Generation2_ignore_sku_filters.some(reg => this.fe?.sku?.name.match(reg))) {
            return !((item.info?.id || '').includes('gen2'))
          }
          return true
        })
      }
      this.os = osOpts.length ? osOpts[0].key : undefined
      this.image = imageOpts.length ? imageOpts[0].id : undefined
      if (!this.isShowComponent) {
        this.image = this.formFd?.fe?.image?.id || (imageOpts.length ? imageOpts[0].id : undefined)
      }
      this.imagesInfo = {
        osOpts,
        imageOpts,
      }
      this.imageOpts = R.clone(imageOpts)
      this.change(this.image, true)

      // this.fillImageOpts()
    },
    filterOption (inp, option) {
      const input = inp.toLowerCase()
      const text = _.get(option.componentOptions, 'children[0].key') || ''
      return text.toLowerCase().indexOf(input) >= 0
    },
    imgLabels (img) {
      const min_disk = sizestr(img.min_disk, 'M', 1024)
      const size = sizestr(img.size, 'B', 1024)
      const props = img.properties || (img.info ? img.info.properties : undefined)
      const arch = props && props.os_arch && props.os_arch === 'aarch64' ? this.$t('compute.cpu_arch.aarch64') : props?.os_arch || 'x86_64'
      let bios = 'BIOS'
      if (props) {
        const { uefi_support, bios_support } = props
        if (uefi_support === 'true' && bios_support === 'true') {
          bios = 'BIOS & UEFI'
        } else if (uefi_support === 'true' && bios_support !== 'true') {
          bios = 'UEFI'
        }
      }
      const part = props && props.partition_type ? props.partition_type.toUpperCase() : 'MBR'
      return `${min_disk}|${size}|${arch}|${part}|${bios}`
    },
    isEncryped (img) {
      return !!img.encrypt_key_id
    },
  },
}
</script>
