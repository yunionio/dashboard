<template>
  <div>
    <a-alert type="warning">
      <span slot="message">{{ $t('common.image_url_tip') }} <a href="https://www.cloudpods.org/docs/guides/onpremise/glance/common-image-url" target="_blank">{{ $t('common.normal_open_image') }}</a></span>
    </a-alert>
    <page-header :title="$t('compute.text_642')" />
    <page-body needMarginBottom>
      <page-list
        class="mt-2"
        :list="list"
        :columns="columns"
        :showPage="false"
        :showSync="false"
        @filterChange="handleFilterChange"
        @change-selected="handleSelected">
        <template slot="group-actions-append">
          <div class="mb-2">{{ $t('common.select_import_image') }}</div>
        </template>
      </page-list>
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button class="mr-3" type="primary" @click="handleConfirm" :disabled="selectedImages.length === 0" :loading="loading">{{$t('cloudenv.text_169')}}</a-button>
        <a-button @click="cancel">{{$t('cloudenv.text_170')}}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import axios from 'axios'
import WindowsMixin from '@/mixins/windows'
import { getNameFilter } from '@/utils/common/tableFilter'

const fileUrl = 'http://www.cloudpods.org/openimages.yaml'
const attributes = ['distribution', 'os_name', 'os_arch', 'os_version', 'build', 'source', 'url']

export default {
  name: 'ImageMarket',
  mixins: [WindowsMixin],
  data () {
    return {
      loading: false,
      imageList: [],
      list: this.$list.createList(this, {
        id: 'ImageMarketList',
        filterOptions: {
          distribution: getNameFilter({ label: this.$t('compute.text_657') }),
          os: getNameFilter({ label: this.$t('scope.text_160') }),
          os_arch: getNameFilter({ label: this.$t('common.arch') }),
          source: getNameFilter({ label: this.$t('common.image_source') }),
          url: getNameFilter({ label: this.$t('common.download_url') }),
        },
      }),
      columns: [
        {
          field: 'distribution',
          title: this.$t('compute.text_657'),
          minWidth: 150,
          formatter: ({ row }) => {
            return row.distribution || '-'
          },
        },
        {
          field: 'os_name',
          title: this.$t('scope.text_160'),
          minWidth: 200,
          formatter: ({ row }) => {
            return `${row.os_name} ${row.os_version}`
          },
        },
        {
          field: 'os_arch',
          title: this.$t('common.arch'),
          minWidth: 150,
          formatter: ({ row }) => {
            return row.os_arch || '-'
          },
        },
        {
          field: 'source',
          title: this.$t('common.image_source'),
          minWidth: 200,
          formatter: ({ row }) => {
            return row.source || '-'
          },
        },
        {
          field: 'url',
          title: this.$t('common.download_url'),
          minWidth: 300,
          slots: {
            default: ({ row }) => {
              return [<list-body-cell-wrap copy field='url' row={row} hideField={true} message={row.url}>
                {row.url}
              </list-body-cell-wrap>]
            },
          },
        },
      ],
      selectedImages: [],
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
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
    fetchData () {
      this.loading = true
      axios.get(fileUrl).then(res => {
        const { data = '' } = res
        this.imageList = this.parseImageData(data)
        this.list.responseData = {
          data: this.imageList.map(item => {
            item.os = `${item.os_name} ${item.os_version}`
            item.name = `${item.distribution}-${item.os_name}-${item.os_version}-${item.os_arch}`
            return item
          }),
        }
        this.loading = false
        this.list.fetchData()
      }).catch(err => {
        this.list.fetchDta()
        this.loading = false
        throw err
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
