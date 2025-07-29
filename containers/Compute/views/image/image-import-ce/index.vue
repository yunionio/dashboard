<template>
  <div>
    <a-alert type="warning" v-if="isCE || $store.getters.isSysCE">
      <span slot="message">{{ $t('common.image_url_tip') }} <a href="https://www.cloudpods.org/docs/guides/onpremise/glance/common-image-url" target="_blank">{{ $t('common.normal_open_image') }}</a></span>
    </a-alert>
    <a-alert type="warning" v-else>
      <span slot="message">{{ $t('common.image_url_tip2') }}</span>
    </a-alert>
    <page-header :title="$t('compute.open_image_market')" />
    <a-form-model class="mt-3 mb-2" v-bind="layout">
      <a-form-model-item>
        <a-radio-group v-model="form.os_arch">
          <a-radio-button v-for="(item, index) in archList" :key="index" :value="item.value">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-model-item>
      <a-form-model-item>
        <a-radio-group v-model="form.source">
          <a-radio-button v-for="(item, index) in sourceList" :key="index" :value="item.value">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-model-item>
      <a-form-model-item>
        <a-radio-group v-model="form.distribution" size="large">
          <a-radio-button v-for="(item, index) in distributionList" :key="index" :value="item.value" style="width:60px;height:60px;text-align:center;line-height:60px;vertical-align:middle;padding:0;"><img v-if="item.os" :src="item.os" style="height:40px;" /></a-radio-button>
        </a-radio-group>
      </a-form-model-item>
    </a-form-model>
    <page-card-list
      :list="list"
      :card-fields="cardFields"
      :showPageer="false"
      :isRefreshed="false"
      :singleActions="singleActions" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import axios from 'axios'
import WindowsMixin from '@/mixins/windows'
import { isCE } from '@/utils/utils'
const path = require('path')
const imagesLogoFiles = require.context('@/assets/images/os-images', false, /.svg$/)
const imagesLogos = []
imagesLogoFiles.keys().forEach(key => {
  const name = path.basename(key, '.svg') // 返回文件名 不含后缀名
  imagesLogos.push(name)
})

const fileUrl = 'https://www.cloudpods.org/openimages.yaml'
const attributes = ['distribution', 'os_name', 'os_arch', 'os_version', 'build', 'source', 'url']

export default {
  name: 'ImageMarket',
  mixins: [WindowsMixin],
  data () {
    return {
      loading: false,
      imageList: [],
      cardFields: {
        url: 'os',
        title: 'title',
        description: 'os_name',
        desc: 'desc',
      },
      list: {
        data: [],
        loading: false,
      },
      layout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      singleActions: [
        {
          label: this.$t('compute.text_679'),
          action: async (data) => {
            try {
              await new this.$Manager('images', 'v2').create({
                data: {
                  domain_id: this.userInfo.projectDomainId,
                  project_id: this.userInfo.projectId,
                  copy_from: data.url,
                  name: data.name,
                  os_arch: data.os_arch,
                  properties: {
                    os_type: data.os_name,
                    os_version: data.os_version,
                    os_arch: data.os_arch,
                  },
                },
              })
              this.$message.success(this.$t('compute.text_423'))
              this.$router.push({ name: 'Image' })
            } catch (error) {
              throw error
            }
          },
          meta: (obj) => {
            return {
              buttonType: 'primary',
            }
          },
        },
      ],
      imagesLogos,
      form: {
        os_arch: 'x86_64',
        source: 'all',
        distribution: 'Debian',
      },
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    archList () {
      const ret = []
      this.imageList.map(item => {
        if (item.data.os_arch && !ret.some(l => l.value === item.data.os_arch)) {
          ret.push({ value: item.data.os_arch, label: item.data.os_arch })
        }
      })
      return ret
    },
    distributionList () {
      const ret = []
      this.imageList.map(item => {
        if (item.data.os_arch === this.form.os_arch && item.data.source_type.includes(this.form.source) && item.data.distribution && !ret.some(l => l.value === item.data.distribution)) {
          ret.push({ value: item.data.distribution, label: item.data.distribution, os: item.data.os })
        }
      })
      return ret
    },
    isce () {
      return isCE()
    },
    sourceList () {
      return [
        { value: 'all', label: this.$t('compute.image_source_global') },
        { value: 'cn', label: this.$t('compute.image_source_cn') },
        { value: 'ov', label: this.$t('compute.image_source_ov') },
      ]
    },
  },
  watch: {
    form: {
      handler (val) {
        this.initList()
      },
      deep: true,
    },
    distributionList (val) {
      if (val.length) {
        if (!val.some(item => item.value === this.form.distribution)) {
          this.form.distribution = val[0].value
        }
      }
    },
  },
  created () {
    this.fetchData()
  },
  methods: {
    parseImageOption (str) {
      let key = ''
      let value = ''
      attributes.map(field => {
        const fieldStart = field + ': '
        if (str.startsWith(fieldStart)) {
          key = field
          value = str.substring(fieldStart.length)
        }
      })
      return { key, value }
    },
    parseImageData (str) {
      const list = str.split('- distribution:')
      const imageList = []
      list.map((str, index) => {
        if (index !== 0) {
          const obj = {}
          const originStr = 'distribution:' + str
          const optsList = originStr.split('\n').filter(item => item.trim() !== '').map(item => item.trim())
          optsList.map(item => {
            const { key, value } = this.parseImageOption(item)
            obj[key] = value
          })
          imageList.push({ ...obj, id: imageList.length + 1 })
        }
      })
      return imageList
    },
    handleFilterChange (filter) {
      const keys = Object.keys(filter)
      this.list.responseData = {
        data: this.imageList.filter(item => {
          return keys.every(key => {
            return item[key] && item[key].toLowerCase().includes(filter[key][0].toLowerCase())
          })
        }),
      }
      this.selectedImages = []
      this.list.fetchData()
    },
    handleSelected (selected) {
      this.selectedImages = selected
    },
    getOsName (item) {
      let ret = ''
      const os_name = (item.distribution || '').toLowerCase()
      ret = this.imagesLogos.includes(os_name) ? os_name : ''
      if (!ret && os_name.includes('ubuntu')) {
        ret = 'ubuntu'
      }
      if (!ret && os_name.includes('anolis')) {
        ret = 'anolis'
      }
      return ret || 'unknow'
    },
    fetchData () {
      this.list.loading = true
      axios.get(fileUrl).then(res => {
        const { data = '' } = res
        this.imageList = this.parseImageData(data).map(item => {
          const ret = { data: { ...item } }
          ret.data.title = `${item.distribution} ${item.os_version}`
          ret.data.desc = this.$t('compute.image_market.desc', [item.os_arch, item.source, item.build || '-'])
          ret.data.name = `${item.distribution}-${item.os_name}-${item.os_version}-${item.os_arch}`
          if (item.build) {
            ret.data.name += `-${item.build}`
          }
          const os_name = this.getOsName(item)
          ret.data.os = require(`@/assets/images/os-images/${this.imagesLogos.includes(os_name) ? os_name : 'unknow'}.svg`) || ''
          ret.data.source_type = this.isChinaDomain(item.url) ? ['all', 'cn'] : ['all', 'ov']
          return ret
        })
        this.initList()
        this.list.loading = false
      }).catch(err => {
        this.list.loading = false
        throw err
      })
    },
    isChinaDomain (url) {
      try {
        const { hostname } = new URL(url)
        return (
          hostname.endsWith('.cn') ||
          hostname.endsWith('.com.cn') ||
          hostname.endsWith('.net.cn') ||
          hostname.endsWith('.gov.cn') ||
          hostname.endsWith('.edu.cn') ||
          hostname.endsWith('.org.cn')
        )
      } catch (e) {
        return false
      }
    },
    initList () {
      this.list.data = this.imageList.filter(item => {
        const { os_arch, distribution, source_type } = item.data
        if (this.form.os_arch && this.form.os_arch !== 'all' && os_arch !== this.form.os_arch) {
          return false
        }
        if (this.form.distribution && this.form.distribution !== 'all' && distribution !== this.form.distribution) {
          return false
        }
        if (this.form.source && !source_type.includes(this.form.source)) {
          return false
        }
        return true
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        for (let i = 0; i < this.selectedImages.length; i++) {
          const data = this.selectedImages[i]
          await new this.$Manager('images', 'v2').create({
            data: {
              domain_id: this.userInfo.projectDomainId,
              project_id: this.userInfo.projectId,
              copy_from: data.url,
              name: data.name,
              os_arch: data.os_arch,
              properties: {
                os_type: data.os_name,
                os_version: data.os_version,
                os_arch: data.os_arch,
              },
            },
          })
        }
        this.loading = false
        this.$router.push({ name: 'Image' })
      } catch (err) {
        this.$message.error(this.$t('common.failed'))
        this.loading = false
        throw err
      }
    },
  },
}
</script>
