<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">修改属性</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="修改属性" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item label="删除保护" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.disable_delete">
            <a-radio-button
              v-for="item of disableDeleteOptions"
              :key="item.key"
              :value="item.key">{{ item.label }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <template v-if="isKvm">
          <a-form-item label="启动介质" v-bind="formItemLayout">
            <a-radio-group v-decorator="decorators.boot_order">
              <a-radio-button
                v-for="item of bootOrderOptions"
                :key="item.key"
                :value="item.key">{{ item.label }}</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="引导方式" v-bind="formItemLayout">
            <a-radio-group v-decorator="decorators.bios">
              <a-radio-button
                v-for="item of biosOptions"
                :key="item.key"
                :value="item.key">{{ item.label }}</a-radio-button>
            </a-radio-group>
          </a-form-item>
        </template>
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
  name: 'VmUpdateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        disable_delete: [
          'disable_delete',
          {
            rules: [
              { required: true, message: '请选择删除保护' },
            ],
          },
        ],
        boot_order: [
          'boot_order',
          {
            rules: [
              { required: true, message: '请选择启动介质' },
            ],
          },
        ],
        bios: [
          'bios',
          {
            rules: [
              { required: true, message: '请选择引导方式选项' },
            ],
          },
        ],
      },
      bootOrderOptions: [
        {
          label: '硬盘',
          key: 'cdn',
        },
        {
          label: '光驱',
          key: 'dcn',
        },
        {
          label: '网络',
          key: 'ncd',
        },
      ],
      disableDeleteOptions: [
        {
          label: '启用',
          key: true,
        },
        {
          label: '禁用',
          key: false,
        },
      ],
      biosOptions: [
        {
          label: 'BIOS',
          key: 'BIOS',
        },
        {
          label: 'UEFI',
          key: 'UEFI',
        },
      ],
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
      return this.params.data.length >= 1 && this.params.data[0].hypervisor === 'kvm'
    },
  },
  created () {
    this.initFormValue(this.params.data[0])
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const ids = this.params.data.map(item => item.id)
        await this.params.list.onManager('batchUpdate', {
          id: ids,
          managerArgs: {
            data: values,
          },
        })
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
    initFormValue (data) {
      this.$nextTick(() => {
        const updateObj = {
          disable_delete: data.disable_delete,
        }
        if (this.isKvm) {
          updateObj.boot_order = data.boot_order
          updateObj.bios = data.bios
        }
        this.form.fc.setFieldsValue(updateObj)
      })
    },
  },
}
</script>
