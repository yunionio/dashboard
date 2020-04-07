<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">设置镜像/副本数</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" name="资源" action="设置镜像/副本数" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item label="镜像" v-if="containerImages.length">
          <a-form-item v-for="(item, i) in containerImages" :key="i">
            <a-input v-decorator="decorators.image(i)" placeholder="请输入镜像" :addonBefore="item.name" />
          </a-form-item>
        </a-form-item>
        <a-form-item label="副本数" v-if="!params.hideReplicas">
          <a-input v-decorator="decorators.replicas" placeholder="请输入副本数" addonAfter="个" />
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'K8SSetLimitDialog',
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
      decorators: {
        image: i => [
          `images${i}`,
          {
            rules: [
              { required: true, message: '请输入镜像' },
            ],
          },
        ],
        replicas: [
          'replicas',
          {
            rules: [
              { required: true, message: '请输入副本数' },
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
      const imagesFieldValue = {}
      this.containerImages.forEach((item, i) => {
        imagesFieldValue[`images${i}`] = item.image
      })
      this.$nextTick(() => {
        this.form.fc.setFieldsValue({
          ...imagesFieldValue,
          replicas: data.replicas || 3,
        })
      })
    },
    async doUpdate (params) {
      const containers = []
      Object.keys(params).forEach(key => {
        if (key.startsWith('images')) {
          const i = key.replace('images', '')
          containers.push({
            name: this.containerImages[i].name,
            image: params[key],
          })
        }
      })
      const data = {
        replicas: params.replicas,
        cluster: this.data.cluster,
        namespace: this.data.namespace,
        containers,
      }
      if (params.hideReplicas) delete data.replicas
      try {
        await this.params.onManager('update', {
          id: this.data.name,
          managerArgs: {
            data,
          },
        })
      } catch (error) {
        throw error
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.form.fc.validateFields()
        await this.doUpdate(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
