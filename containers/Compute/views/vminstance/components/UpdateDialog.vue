<template>
  <a-modal
    title="修改属性"
    ok-text="确定"
    cancel-text="取消"
    destroy-on-close
    :visible="visible"
    :confirm-loading="loading"
    @cancel="handleCancel"
    @ok="handleConfirm">
    <div class="mb-2">你所选的<span class="ml-2 mr-2" style="color: #1890ff;">{{ this.selectedItems.length }}个实例</span>将执行<span class="ml-2 mr-2" style="color: #faad14;">修改属性</span>操作，你是否确认操作？</div>
    <vxe-grid class="mb-2" :data="selectedItems" :columns="columns.slice(0, 3)" />
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
  </a-modal>
</template>

<script>
export default {
  props: ['visible', 'selectedItems', 'list', 'columns'],
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
          span: 19,
        },
        labelCol: {
          span: 5,
        },
      },
    }
  },
  computed: {
    isKvm () {
      return this.selectedItems.length >= 1 && this.selectedItems[0].hypervisor === 'kvm'
    },
  },
  watch: {
    selectedItems: {
      handler (val) {
        if (val && val.length >= 1) {
          this.initFormValue(val[0])
        }
      },
    },
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    handleCancel () {
      this.$emit('update:visible', false)
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        const ids = this.selectedItems.map(item => item.id)
        await this.list.onManager('batchUpdate', {
          id: ids,
          managerArgs: {
            data: values,
          },
        })
        this.loading = false
        this.handleCancel()
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
