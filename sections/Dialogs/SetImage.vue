<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">设置镜像</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" name="资源" action="设置镜像" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-alert message="该资源既无镜像也无初始化镜像" banner v-if="!containerImages.length && !initContainerImages.length" />
        <a-form-item label="初始化镜像" v-if="initContainerImages.length">
          <a-form-item v-for="(item, i) in initContainerImages" :key="i">
            <a-input v-decorator="decorators.initImage(i)" placeholder="请输入镜像" :addonBefore="item.name" />
          </a-form-item>
        </a-form-item>
        <a-form-item label="镜像" v-if="containerImages.length">
          <a-form-item v-for="(item, i) in containerImages" :key="i">
            <a-input v-decorator="decorators.image(i)" placeholder="请输入镜像" :addonBefore="item.name" />
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'K8SSetImageDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fd: {},
      },
      data: this.params.data[0],
      containerImages: [],
      initContainerImages: [],
      decorators: {
        image: i => [
          `images${i}`,
          {
            rules: [
              { required: true, message: '请输入镜像' },
            ],
          },
        ],
        initImage: i => [
          `initImages${i}`,
          {
            rules: [
              { required: true, message: '请输入镜像' },
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
          id: this.data.name,
          params: {
            cluster: this.data.cluster,
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
          if (key.startsWith('images')) {
            const i = key.replace('images', '')
            if (this[detailField][i] && this[detailField][i].name) {
              field.push({
                name: this[detailField][i].name,
                image: params[key],
              })
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
          id: this.data.name,
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
        if (R.is(Function, this.params.success)) this.params.success()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
