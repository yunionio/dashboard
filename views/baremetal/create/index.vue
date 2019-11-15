<template>
  <div>
    <page-header title="创建裸金属服务器" />
    <a-form
      class="mt-3"
      :form="form"
      @submit="submit">
      <a-form-item label="区域" class="mb-0" v-bind="formItemLayout">
        <cloudregion-zone
          :zone-params="params.zone"
          :region-params="params.region"
          :decorator="decorators.regionZone" />
      </a-form-item>
      <a-form-item label="名称" v-bind="formItemLayout">
        <a-input v-decorator="decorators.name" :placeholder="$t('validator.serverName')" />
      </a-form-item>
      <a-form-item label="数量" v-bind="formItemLayout">
        <a-input-number v-decorator="decorators.count" :min="1" :max="10" />
      </a-form-item>
      <a-form-item v-bind="formItemLayout" label="镜像" class="mb-0">
        <os-select :image-params="params.image" :decorator="decorators.imageOS" />
      </a-form-item>
      <a-form-item label="规格" v-bind="formItemLayout" class="mb-0">
        <spec :decorator="decorators.spec" />
      </a-form-item>
      <a-form-item label="管理员密码" v-bind="formItemLayout">
        <server-password :decorator="decorators.loginConfig" />
      </a-form-item>
      <bottom-bar />
    </a-form>
  </div>
</template>
<script>
import _ from 'lodash'
import * as R from 'ramda'
import { CreateServerForm } from '@Compute/constants'
import Spec from '@Compute/sections/Spec'
import ServerPassword from '@Compute/sections/ServerPassword'
import OsSelect from '@Compute/sections/OsSelect'
import BottomBar from './BottomBar'
import CloudregionZone from '@/sections/CloudregionZone'
import { isRequired } from '@/utils/validate'
import { Manager } from '@/utils/manager'

export default {
  name: 'BaremetalCreate',
  components: {
    OsSelect,
    CloudregionZone,
    Spec,
    BottomBar,
    ServerPassword,
  },
  data () {
    return {
      top: 80,
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
      form: this.$form.createForm(this, { onFieldsChange: this.onFieldsChange }),
      fi: { // formInfo 存储着和表单相关的数据
        capability: {}, // 可用区下的可用资源
        imageMsg: {}, // 当前选中的 image
        specs: {}, // 所有 disk 规格的全集
      },
      decorators: {
        name: [
          'name',
          {
            initialValue: '',
            validateTrigger: 'blur',
            validateFirst: true,
            rules: [
              { required: true, message: '请输入名称' },
              { validator: this.$validate('serverName') },
            ],
          },
        ],
        count: [
          'count',
          {
            initialValue: 1,
          },
        ],
        regionZone: {
          region: [
            'region',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { validator: isRequired(), message: '请选择区域' },
              ],
            },
          ],
          zone: [
            'zone',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { validator: isRequired(), message: '请选择可用区' },
              ],
            },
          ],
        },
        imageOS: {
          os: [
            'os',
            {
              initialValue: '',
              rules: [
                { required: true, message: '请选择操作系统' },
              ],
            },
          ],
          image: [
            'image',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { validator: isRequired(), message: '请选择镜像' },
              ],
            },
          ],
        },
        spec: [
          'spec',
          {
            initialValue: { key: '', label: '' },
            rules: [
              { validator: isRequired(), message: '请选择规格' },
            ],
          },
        ],
        loginConfig: {
          loginType: [
            'loginType',
            {
              initialValue: 'random',
            },
          ],
          keypair: [
            'keypair',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { validator: isRequired(), message: '请选择关联密钥' },
              ],
            },
          ],
          password: [
            'password',
            {
              initialValue: '',
              rules: [
                { required: true, message: '请输入密码' },
              ],
            },
          ],
        },
      },
      params: {
        zone: {},
        region: {
          usable: true,
          is_on_premise: true,
          scope: 'system',
        },
        image: {
          limit: 0,
          details: true,
          status: 'active',
          scope: 'system',
          'filter.0': 'disk_format.notequals(iso)',
        },
      },
      diskSpecs: {}, // 当前选中磁盘规格, 未来给 diskconfig 使用
    }
  },
  provide () {
    return {
      form: this.form,
      fi: this.fi,
    }
  },
  created () {
    this.$bus.$on('VMInstanceCreateUpdateFi', this.updateFi, this)
  },
  methods: {
    updateFi (fiItems) { // 子组件更新fi
      if (R.is(Object, fiItems)) {
        R.forEachObjIndexed((item, key) => {
          this.fi[key] = item
        }, fiItems)
      }
    },
    zoneFetchDoneTodo () {
      this.fetchCapability()
    },
    onFieldsChange (vm, changedFields) {
      if (_.get(changedFields, 'zone.value.key')) { // 可用区变化
        this.zoneFetchDoneTodo()
      }
      const specValueKey = _.get(changedFields, 'spec.value.key')
      if (specValueKey) { // 规格
        this.diskSpecs = this.fi.specs[specValueKey]
      }
    },
    submit (e) {
      e.preventDefault()
      this.validateForm()
        .then(formData => {
        })
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    fetchCapability () {
      const manager = new Manager('zones', 'v2')
      const params = {
        show_emulated: true,
        resource_type: 'shared',
        scope: 'system',
        host_type: 'baremetal',
      }
      const { key } = this.form.getFieldValue('zone')
      manager.getSpecific({ id: key, spec: 'capability', params })
        .then(({ data }) => {
          this.fi.capability = data
        })
    },
  },
}
</script>
