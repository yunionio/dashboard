<template>
  <base-dialog width="1200px" @cancel="cancelDialog">
    <div slot="header">{{$t('k8s.text_63')}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :name="$t('k8s.text_64')" :action="$t('k8s.text_63')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-alert :message="$t('k8s.text_65')" banner v-if="!containerImages.length && !initContainerImages.length" />
        <a-form-item :label="$t('k8s.repo.image.source')">
          <a-radio-group v-decorator="decorators.source" @change="handleSourceChange">
            <a-radio-button value="custom">{{ $t('k8s.repo.image.custom') }}</a-radio-button>
            <a-radio-button value="registry">{{ $t('k8s.repo.image.registry') }}</a-radio-button>
            <a-radio-button value="container_image">{{ $t('k8s.repo.image.container_image') }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('k8s.text_66')" v-if="initContainerImages.length">
          <a-form-item v-for="(item, i) in initContainerImages" :key="'init-' + i">
            <mirror-registry v-if="form.fd.source === 'registry'" v-decorator="decorators.initRegistryImage(i)" :label="item.name" />
            <a-select
              v-else-if="form.fd.source === 'container_image'"
              v-decorator="decorators.initContainerImageId(i)"
              showSearch
              :filterOption="filterOption"
              :loading="glanceImageLoading"
              :placeholder="$t('common.tips.select', [$t('k8s.repo.image.container_image')])"
              allowClear>
              <a-select-option
                v-for="img in glanceImages"
                :key="img.value"
                :value="img.value"
                :label="img.label">
                <div>{{ img.label }}</div>
                <div style="font-size: 12px; color: #999;">{{ img.ref }}</div>
              </a-select-option>
            </a-select>
            <a-input v-else v-decorator="decorators.initImage(i)" :placeholder="$t('k8s.text_67')" :addonBefore="item.name" />
          </a-form-item>
        </a-form-item>
        <a-form-item :label="$t('k8s.text_42')" v-if="containerImages.length">
          <a-form-item v-for="(item, i) in containerImages" :key="'ctn-' + i">
            <mirror-registry v-if="form.fd.source === 'registry'" v-decorator="decorators.registryImage(i)" :label="item.name" />
            <a-select
              v-else-if="form.fd.source === 'container_image'"
              v-decorator="decorators.containerImageId(i)"
              showSearch
              :filterOption="filterOption"
              :loading="glanceImageLoading"
              :placeholder="$t('common.tips.select', [$t('k8s.repo.image.container_image')])"
              allowClear>
              <a-select-option
                v-for="img in glanceImages"
                :key="img.value"
                :value="img.value"
                :label="img.label">
                <div>{{ img.label }}</div>
                <div style="font-size: 12px; color: #999;">{{ img.ref }}</div>
              </a-select-option>
            </a-select>
            <a-input v-else v-decorator="decorators.image(i)" :placeholder="$t('k8s.text_67')" :addonBefore="item.name" />
          </a-form-item>
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import MirrorRegistry from '@K8S/sections/MirrorRegistry'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'
import { removeHttp } from '@/utils/url'

export default {
  name: 'K8SSetImageDialog',
  components: {
    MirrorRegistry,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      glanceImageLoading: false,
      glanceImages: [],
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach(key => {
              this.$set(this.form.fd, key, values[key])
            })
          },
        }),
        fd: {
          source: 'custom',
        },
      },
      data: this.params.data[0],
      containerImages: [],
      initContainerImages: [],
      decorators: {
        source: [
          'source',
          {
            initialValue: 'custom',
          },
        ],
        registryImage: i => [
          `registryImages${i}`,
          {
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('k8s.repo.image.registry')]) },
            ],
          },
        ],
        initRegistryImage: i => [
          `initRegistryImages${i}`,
          {
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('k8s.repo.image.registry')]) },
            ],
          },
        ],
        containerImageId: i => [
          `containerImageIds${i}`,
          {
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('k8s.repo.image.container_image')]) },
            ],
          },
        ],
        initContainerImageId: i => [
          `initContainerImageIds${i}`,
          {
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('k8s.repo.image.container_image')]) },
            ],
          },
        ],
        image: i => [
          `images${i}`,
          {
            rules: [
              { required: true, message: this.$t('k8s.text_67') },
            ],
          },
        ],
        initImage: i => [
          `initImages${i}`,
          {
            rules: [
              { required: true, message: this.$t('k8s.text_67') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  created () {
    this.fetchData()
  },
  methods: {
    filterOption (input, option) {
      const label = option.componentOptions?.propsData?.label || ''
      return label.toLowerCase().indexOf((input || '').toLowerCase()) >= 0
    },
    handleSourceChange (e) {
      const source = e.target.value
      this.$set(this.form.fd, 'source', source)
      if (source === 'container_image' && this.glanceImages.length === 0) {
        this.fetchGlanceImages()
      }
    },
    async fetchGlanceImages () {
      try {
        this.glanceImageLoading = true
        const manager = new this.$Manager('container_images', 'v1')
        const result = await manager.list({
          params: {
            details: true,
            limit: 100,
            scope: this.$store.getters.scope,
          },
        })
        const dataArr = result.data.data || []
        this.glanceImages = dataArr.map(item => ({
          label: item.name || `${item.image_name}:${item.image_label}`,
          value: item.id,
          ref: `${item.image_name}:${item.image_label}`,
        }))
      } catch (error) {
        throw error
      } finally {
        this.glanceImageLoading = false
      }
    },
    async fetchData () {
      const { data } = await this.params.onManager('get', {
        managerArgs: {
          id: this.data.id,
          params: {
            cluster: this.data.cluster_id,
            namespace: this.data.namespace,
          },
        },
      })
      this.containerImages = data.containerImages
      this.initContainerImages = data.initContainerImages || []
      const imagesFieldValue = {}
      this.containerImages.forEach((item, i) => {
        imagesFieldValue[`images${i}`] = item.image
      })
      this.initContainerImages.forEach((item, i) => {
        imagesFieldValue[`initImages${i}`] = item.image
      })
      this.$nextTick(() => {
        this.form.fc.setFieldsValue(imagesFieldValue)
      })
    },
    resolveImage (params, i, { customKey, registryKey, containerImageKey }) {
      if (params.source === 'registry') {
        return removeHttp(params[registryKey])
      }
      if (params.source === 'container_image') {
        const id = params[containerImageKey]
        const found = this.glanceImages.find(g => g.value === id)
        return found ? found.ref : id
      }
      return removeHttp(params[customKey])
    },
    async doUpdate (params) {
      const containers = this.containerImages.map((item, i) => ({
        name: item.name,
        image: this.resolveImage(params, i, {
          customKey: `images${i}`,
          registryKey: `registryImages${i}`,
          containerImageKey: `containerImageIds${i}`,
        }),
      }))
      const initContainers = this.initContainerImages.map((item, i) => ({
        name: item.name,
        image: this.resolveImage(params, i, {
          customKey: `initImages${i}`,
          registryKey: `initRegistryImages${i}`,
          containerImageKey: `initContainerImageIds${i}`,
        }),
      }))
      const data = {
        cluster: this.data.cluster,
        namespace: this.data.namespace,
        containers,
        initContainers,
      }
      try {
        await this.params.onManager('update', {
          id: this.data.id,
          managerArgs: {
            data,
          },
          steadyStatus: Object.values(expectStatus.k8s_resource).flat(),
        })
      } catch (error) {
        throw error
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doUpdate(values)
        this.loading = false
        this.cancelDialog()
        this.params.refresh && this.params.refresh()
        if (R.is(Function, this.params.success)) this.params.success()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
