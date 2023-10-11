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
          <a-radio-group v-decorator="decorators.source">
            <a-radio-button value="custom">{{ $t('k8s.repo.image.custom') }}</a-radio-button>
            <a-radio-button value="registry">{{ $t('k8s.repo.image.registry') }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('k8s.text_66')" v-if="initContainerImages.length">
          <a-form-item v-for="(item, i) in initContainerImages" :key="i">
            <mirror-registry v-show="form.fd.source === 'registry'"  v-decorator="decorators.registryImage(i)" :label="item.name" />
            <a-input v-show="form.fd.source !== 'registry'" v-decorator="decorators.initImage(i)" :placeholder="$t('k8s.text_67')" :addonBefore="item.name" />
          </a-form-item>
        </a-form-item>
        <a-form-item :label="$t('k8s.text_42')" v-if="containerImages.length">
          <a-form-item v-for="(item, i) in containerImages" :key="i">
            <mirror-registry v-show="form.fd.source === 'registry'"  v-decorator="decorators.registryImage(i)" :label="item.name" />
            <a-input v-show="form.fd.source !== 'registry'" v-decorator="decorators.image(i)" :placeholder="$t('k8s.text_67')" :addonBefore="item.name" />
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
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach(key => {
              this.$set(this.form.fd, key, values[key])
            })
          },
        }),
        fd: {},
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
    async doUpdate (params) {
      const containers = []
      const initContainers = []
      const getImages = (field, decorator, detailField) => {
        Object.keys(params).forEach(key => {
          if (params.source === 'registry') {
            if (key.startsWith('registryImages')) {
              const i = key.replace('registryImages', '')
              if (this[detailField][i] && this[detailField][i].name) {
                field.push({
                  name: this[detailField][i].name,
                  image: removeHttp(params[key]),
                })
              }
            }
          } else {
            console.log(params)
            if (key.startsWith('images')) {
              const i = key.replace('images', '')
              if (this[detailField][i] && this[detailField][i].name) {
                field.push({
                  name: this[detailField][i].name,
                  image: removeHttp(params[key]),
                })
              }
            }
          }
        })
        return field
      }
      const data = {
        cluster: this.data.cluster,
        namespace: this.data.namespace,
        containers: getImages(containers, 'images', 'containerImages'),
        initContainers: getImages(initContainers, 'initImages', 'initContainerImages'),
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
