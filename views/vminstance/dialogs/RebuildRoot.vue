<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="action" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item v-bind="formItemLayout" label="操作系统" extra="操作系统会根据选择的虚拟化平台和可用区域的变化而变化公共镜像的维护请联系管理员">
          <os-select :type="type" :hypervisor="hypervisor" :image-params="image" :decorator="decorators.imageOS" />
        </a-form-item>
        <a-form-item label="管理员密码" v-bind="formItemLayout">
          <server-password :decorator="decorators.loginConfig" />
        </a-form-item>
        <a-form-item v-bind="formItemLayout">
          <a-checkbox v-decorator="decorators.autoStart">
            重装系统后自动启动
          </a-checkbox>
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
import OsSelect from '@Compute/sections/OsSelect'
import ServerPassword from '@Compute/sections/ServerPassword'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { HYPERVISORS_MAP } from '@/constants'
import { IMAGES_TYPE_MAP } from '@/constants/compute'
import { isRequired } from '@/utils/validate'
import { findPlatform } from '@/utils/common/hypervisor'

export default {
  name: 'VmRebuildRootDialog',
  components: {
    OsSelect,
    ServerPassword,
  },
  provide: function () {
    return {
      form: this.form,
    }
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: '重装系统',
      form: {
        fc: this.$form.createForm(this),
      },
      image: {
        limit: 0,
        scope: '',
        details: true,
        status: 'active',
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
    hypervisor () {
      return this.params.data[0].hypervisor
    },
    isZStack () {
      return this.hypervisor === HYPERVISORS_MAP.zstack.key
    },
    decorators () {
      const validateToImage = (isZStack) => {
        return (rule, value, callback) => {
          if (isZStack) {
            callback()
          } else {
            isRequired()(rule, value, callback)
          }
        }
      }
      return {
        imageOS: {
          os: [
            'os',
            {
              initialValue: '',
              rules: [
                { required: !this.isZStack, message: '请选择操作系统' },
              ],
            },
          ],
          image: [
            'image',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { validator: validateToImage(this.isZStack), message: '请选择镜像' },
              ],
            },
          ],
          imageType: [
            'imageType',
            {
              initialValue: IMAGES_TYPE_MAP.standard.key,
            },
          ],
        },
        loginConfig: {
          loginType: [
            'loginType',
            {
              initialValue: 'random',
            },
          ],
          keypair: [
            'loginKeypair',
            {
              initialValue: undefined, // { key: '', label: '' }
              rules: [
                { validator: isRequired(), message: '请选择关联密钥' },
              ],
            },
          ],
          password: [
            'loginPassword',
            {
              initialValue: '',
              rules: [
                { required: true, message: '请输入密码' },
              ],
            },
          ],
        },
        autoStart: [
          'autoStart',
          {
            valuePropName: 'checked',
            initialValue: true,
          },
        ],
      }
    },
    type () {
      const brand = this.params.data[0].brand
      return findPlatform(brand)
    },
  },
  methods: {
    async doRebuildRootSubmit (data) {
      const { autoStart, image, loginType, loginKeypair, loginPassword } = data
      const ids = this.params.data.map(item => item.id)
      const params = {
        reset_password: true,
        auto_start: autoStart,
        image_id: image.key,
      }
      if (this.isZStack) {
        params.image_id = this.params.data[0].disks_info[0].image_id
      }
      if (loginType === 'keypair') {
        params['keypair'] = loginKeypair.key
        params['reset_password'] = false
      } else if (loginType === 'reset_password') {
        params['reset_password'] = false // 如果登录方式为创建后设置, 则增加参数 reset_password = false
      } else if (loginType === 'password') {
        params['password'] = loginPassword
      }
      return this.params.list.onManager('batchPerformAction', {
        steadyStatus: ['running', 'ready'],
        id: ids,
        managerArgs: {
          action: 'rebuild-root',
          data: params,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doRebuildRootSubmit(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
