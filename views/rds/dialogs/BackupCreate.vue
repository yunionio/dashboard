<template>
    <base-dialog @cancel="cancelDialog" :width="900">
        <div slot="header">创建账号</div>
        <a-form slot="body" :form="form.fc" class="mt-3">
            <a-form-item  v-bind="formItemLayout" label="名称">
                <a-input v-decorator="decorators.name" placeholder="字母开头，数字和字母大小写组合，长度为2-128个字符，不含’.‘,’_‘,’@‘ " />
            </a-form-item>
            <a-form-item v-bind="formItemLayout" label="描述">
              <a-textarea v-decorator="decorators.name" placeholder="请输入描述信息" :rows="4" />
            </a-form-item>
        </a-form>
         <div slot="footer">
            <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
            <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
         </div>
    </base-dialog>
</template>

<script>
import { CreateServerForm } from '@Compute/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
// import validateForm from '@/utils/validate'

export default {
  name: 'RDSBackupCreate',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  computed: {
    decorators () {
      const decorators = {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入名称' },
            ],
          },
        ],
        description: [
          'description',
          {
            rules: [
              { max: 200 },
            ],
          },
        ],
      }
      return decorators
    },
  },
  created () {
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
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        const params = {
          ...values,
        }
        const ret = await this.params.list.onManager('create', {
          managerArgs: {
            data: params,
          },
        })
        console.log(ret)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
