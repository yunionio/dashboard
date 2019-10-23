<template>
    <base-dialog @cancel="cancelDialog">
        <div slot="header">新建</div>
        <a-form slot="body" :form="form.fc" class="mt-3">
            <a-form-item label="分组名">
                <a-input placeholder="请选择分组名称" v-decorator="decorators.name" />
            </a-form-item>
            <a-form-item label="IP地址/地段名">
                <a-textarea placeholder="请选择分组名称"
                 :autosize="{ minRows: 4, maxRows: 7 }"
                 v-decorator="decorators['ip_list']" />
            </a-form-item>
        </a-form>
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
  name: 'WhiteListForm',
  mixins: [DialogMixin, WindowsMixin],
  props: {
    initialValues: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data () {
    return {
      loading: false,
      title: '新建',
      form: {
        fc: this.$form.createForm(this),
      },
    }
  },
  computed: {
    decorators () {
      console.log(this.initialValues)
      const { name } = this.initialValues
      const decorators = {
        name: [
          'name',
          {
            initialValue: name,
            rules: [{ required: true, message: '请输入名称' }],
          },
        ],
        ip_list: [
          'ip_list',
          {
            initialValue: this.initialValues['ip_list'],
            rules: [{ required: true, message: '请添加IP地址/地段名' }],
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
        console.log(this)
        await this.params.list.onManager('create', {
          managerArgs: {
            data: {
              ...values,
              elasticcache: this.params.redisItem.id,
            },
          },
        })
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
