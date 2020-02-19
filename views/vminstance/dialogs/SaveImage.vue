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
          <a-input v-decorator="decorators.generate_name" :placeholder="$t('validator.imageName')" @change="e => {form.fi.generate_name = e.target.value}" />
          <name-repeated
            v-slot:extra
            res="images"
            version="v1"
            :name="form.fi.generate_name" />
        </a-form-item>
        <a-form-item label="自动启动" v-bind="formItemLayout">
          <a-switch checkedChildren="开" unCheckedChildren="关" v-decorator="decorators.auto_start" />
          <template v-slot:extra>
            <div>保存镜像成功后是否自动启动</div>
            <div v-if="form.fi.type === types.host.key" class="mt-2">友情提示：该主机镜像占用镜像配额 {{ diskCount }} 个</div>
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { typeClouds } from '@/utils/common/hypervisor'
import NameRepeated from '@/sections/NameRepeated'

const hypervisorMap = typeClouds.hypervisorMap

export default {
  name: 'VmSaveImageDialog',
  components: {
    NameRepeated,
  },
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
              { validator: this.$validate('imageName') },
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
    diskCount () {
      return this.params.data[0].disk_count
    },
  },
  methods: {
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
    },
  },
}
</script>
