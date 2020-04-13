<template>
  <a-form-item v-bind="offsetFormItemLayout">
    <a-spin :spinning="loading">
      <a-checkbox-group v-decorator="decorators.imageIds">
        <a-col class="mb-2" v-for="(item, id) of images" :key="id" :span="24">
          <a-checkbox :value="id">
            {{ item.name }}（{{ item._size }}）
          </a-checkbox>
        </a-col>
      </a-checkbox-group>
    </a-spin>
  </a-form-item>
</template>

<script>
import { sizestr } from '@/utils/utils'

export default {
  name: 'ISOImport',
  data () {
    return {
      loading: false,
      images: {},
      decorators: {
        imageIds: [
          'imageIds',
          {
            rules: [
              { required: true, message: '请选择镜像（可多选）' },
            ],
          },
        ],
      },
    }
  },
  inject: ['offsetFormItemLayout'],
  created () {
    this.getImagesInfo()
    this.imagesManager = new this.$Manager('images', 'v1')
  },
  methods: {
    async getImagesInfo () {
      this.loading = true
      const manager = new this.$Manager('imageutils', 'v1')
      try {
        const { data = [] } = await manager.get({
          id: 'imagesinfo',
        })
        const _images = {}
        data.forEach((item) => {
          if (!item.hasOwnProperty('distribution')) {
            console.warn('warnning, image missing key distribution', item)
            return
          }
          if (!item.hasOwnProperty('type')) {
            console.warn('warnning, image missing key type', item)
            return
          }
          item['_size'] = sizestr(item.size, 'B', 1024)
          if (item.imported === 'false') {
            const { id } = item
            _images[id] = item
          }
        })
        this.images = _images
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    async doSubmit (fc) {
      const imageIds = fc.getFieldValue('imageIds')
      try {
        await fc.validateFields(['imageIds'])
        const promises = []
        imageIds.forEach(id => {
          const item = this.images[id]
          const params = {
            name: item.name,
            copy_from: item.url,
            disk_format: item.format,
            is_public: true,
            protected: true,
            is_standard: true,
            properties: {
              os_type: item.type,
              os_arch: item.arch,
              os_description: item.distribution,
              os_distribution: item.distribution,
              os_version: item.version,
            },
          }
          promises.push(new Promise((resolve, reject) => {
            this.imagesManager.create({
              data: params,
            }).then(res => {
              resolve(res)
            }).catch(err => {
              reject(err)
            })
          }))
        })
        const ret = await Promise.all(promises)
        console.log(ret)
      } catch (err) {
        throw err
      }
    },
  },
}
</script>

<style>

</style>
