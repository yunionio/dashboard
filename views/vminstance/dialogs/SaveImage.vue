<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">保存镜像</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="保存镜像" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item label="镜像类别" v-bind="formItemLayout" v-if="isKvm">
          <a-radio-group v-decorator="decorators.type" @change="handleTypeChange">
            <a-radio-button :value="types.system.key">{{ types.system.label }}</a-radio-button>
            <a-radio-button :value="types.host.key">{{ types.host.label }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="名称" v-bind="formItemLayout">
          <a-input v-decorator="decorators.generate_name" :placeholder="$t('validator.resourceName')" @change="debounceFetchImages" />
          <template v-if="nameRepeated" v-slot:extra>名称重复，系统默认追加“-1”</template>
        </a-form-item>
        <a-form-item label="自动启动" v-bind="formItemLayout">
          <a-switch v-decorator="decorators.auto_start" />
          <template v-slot:extra>
            <div>保存镜像成功后自动启动</div>
            <div v-if="form.fi.type === types.system.key" class="mt-2">友情提示：该主机镜像占用镜像配额 1 个</div>
          </template>
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
import debounce from 'lodash/debounce'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { typeClouds } from '@/utils/common/hypervisor'

const hypervisorMap = typeClouds.hypervisorMap

export default {
  name: 'VmSaveImageDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const types = {
      host: {
        key: 'host',
        label: '创建主机镜像',
      },
      system: {
        key: 'system',
        label: '创建系统镜像',
      },
    }
    const typeInitialValue = types.system.key
    return {
      loading: false,
      types,
      images: [],
      form: {
        fc: this.$form.createForm(this),
        fi: {
          type: typeInitialValue,
          generate_name: '',
        },
      },
      decorators: {
        type: [
          'type',
          {
            initialValue: typeInitialValue,
          },
        ],
        generate_name: [
          'generate_name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入名称' },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        auto_start: [
          'auto_start',
          {
            initialValue: true,
            valuePropName: 'checked',
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
  computed: {
    isKvm () {
      return this.params.data[0].hypervisor === hypervisorMap.kvm.key
    },
    nameRepeated () {
      return !!this.images.find(item => item.name === this.form.fi.generate_name)
    },
  },
  destroyed () {
    this.debounceFetchImages = null
  },
  created () {
    this.debounceFetchImages = debounce(e => {
      this.form.fi.generate_name = e.target.value
      this.fetchImages(e.target.value)
    }, 300)
  },
  methods: {
    async fetchImages (name) {
      let manager = new this.$Manager(this.form.fi.type === this.types.system.key ? 'images' : 'guestimages', 'v1')
      const params = {
        name,
      }
      try {
        const response = await manager.list({ params })
        const data = response.data.data || []
        this.images = data
      } catch (error) {
        this.images = []
        throw error
      } finally {
        manager = null
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const ids = this.params.data.map(item => item.id)
        const action = values.type === this.types.host.key ? 'save-guest-image' : 'save-image'
        values.id = ids
        values.is_public = false
        values.name = values.generate_name
        delete values.type
        await this.params.list.onManager('batchPerformAction', {
          id: ids,
          steadyStatus: ['running', 'ready'],
          managerArgs: {
            action,
            data: values,
          },
        })
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
    handleTypeChange (e) {
      this.form.fi.type = e.target.value
      if (this.form.fi.generate_name) {
        this.fetchImages(this.form.fi.generate_name)
      }
    },
  },
}
</script>
