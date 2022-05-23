<template>
  <div>
    <div class="mb-4">
      <a-radio-group v-model="market" @change="chooseMaket">
      <a-radio-button value="cloud">{{$t('dictionary.server')}}</a-radio-button>
      <a-radio-button value="iso">ISO</a-radio-button>
    </a-radio-group>
    </div>
    <div>
      <a-radio-group v-model="imported" @change="chooseHandle">
        <a-radio-button :value="false">{{$t('compute.text_677')}}</a-radio-button>
        <a-radio-button :value="true">{{$t('compute.text_678')}}</a-radio-button>
      </a-radio-group>
    </div>
    <page-card-list
      :list="list"
      :card-fields="cardFields"
      :showPageer="false"
      :isRefreshed="false"
      :single-actions="singleActions" />
  </div>
</template>

<script>
import { arrToObjByKey, sizestr } from '@/utils/utils'
import WindowsMixin from '@/mixins/windows'
const path = require('path')
const imagesLogoFiles = require.context('@/assets/images/os-images', false, /.svg$/)
const imagesLogos = []
imagesLogoFiles.keys().forEach(key => {
  const name = path.basename(key, '.svg') // 返回文件名 不含后缀名
  imagesLogos.push(name)
})

export default {
  name: 'ImageImport',
  mixins: [WindowsMixin],
  data () {
    return {
      imported: false,
      market: 'cloud',
      list: {
        limit: 20,
        total: 0,
        offset: 0,
        data: [],
        loading: false,
      },
      cardFields: {
        url: 'os',
        title: 'title',
        description: 'description',
        desc: 'desc',
      },
      isImported: {},
      type: '',
      imagesLogos,
    }
  },
  computed: {
    singleActions () {
      return [
        {
          label: this.imported ? this.$t('compute.text_678') : this.$t('compute.text_679'),
          action: obj => {
            const data = {
              name: obj.name,
              copy_from: obj.url,
              disk_format: obj.format,
              is_public: true,
              is_standard: true,
              protected: true,
              properties: {
                os_type: obj.os_type,
                os_arch: obj.os_arch,
                os_description: obj.os_description,
                os_distribution: obj.os_distribution,
                os_version: obj.os_version,
              },
            }
            new this.$Manager('images', 'v1').create({ data })
              .then(() => {
                this.$set(this.isImported, obj.id, true)
                if (this.type === 'iso') {
                  this.fetchData(this.type)
                } else {
                  this.fetchData()
                }
              })
          },
          meta: (obj) => {
            let validate = true
            if (!this.imported && this.isImported[obj.id]) {
              validate = false
            } else {
              validate = !this.imported
            }
            return {
              buttonType: 'primary',
              validate,
            }
          },
        },
      ]
    },
  },
  created () {
    this.fetchData()
  },
  methods: {
    fetchData (market) {
      this.list.loading = true
      new this.$Manager('imageutils/imagesinfo', 'v1').list({ params: { market } }).then(({ data }) => {
        this.list.loading = false
        const osDesc = (image) => {
          return this.$t('compute.text_680', [
            image.format || '-',
            (image.disk || '-') + 'GiB',
            image.arch || '-',
            sizestr(image.size, 'B', 1024) || '-',
            image.create_at || '-',
          ])
        }
        var publicImages = []
        for (const image of data) {
          if (!image.hasOwnProperty('distribution')) {
            console.log('warnning, image missing key distribution', image)
            continue
          }

          if (!image.hasOwnProperty('type')) {
            console.log('warnning, image missing key type', image)
            continue
          }

          const os = image.distribution.split(' ')[0].toLowerCase()
          const o = {}
          o.id = image.id
          o.name = image.name
          o.url = image.url
          o.format = image.format
          o.os_type = image.type
          o.os_arch = image.arch
          o.os_description = image.os_description
          o.os_distribution = image.distribution
          o.os_version = image.version
          o.class = `fo-${os} os-logo ${image.type.toLowerCase()}`
          o.title = `${image.distribution} ${image.version}`
          o.desc = osDesc(image)
          o.imported = image.imported
          o.os = os || image.type.toLowerCase()
          o.description = image.description
          publicImages.push(o)
        }
        publicImages = publicImages.filter((item) => { return item.imported === this.imported.toString() })
        publicImages.forEach(item => {
          item.os = require(`@/assets/images/os-images/${this.imagesLogos.includes(item.os) ? item.os : 'unknow'}.svg`) || ''
        })
        this.list.data = arrToObjByKey(publicImages, 'id')
      }).catch((e) => {
        this.list.loading = false
        throw e
      })
    },
    chooseHandle () {
      if (this.type === 'iso') {
        this.fetchData(this.type)
      } else {
        this.fetchData()
      }
    },
    chooseMaket (e) {
      if (e.target.value === 'iso') {
        this.type = 'iso'
        this.fetchData(e.target.value)
      } else {
        this.type = ''
        this.fetchData()
      }
    },
  },
}
</script>
