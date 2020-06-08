<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">修改属性</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item label="名称" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" plcaeholder="镜像名称" />
        </a-form-item>
        <!-- <a-form-item label="删除保护" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.protected">
            <a-radio-button value="true">启用</a-radio-button>
            <a-radio-button value="false">禁用</a-radio-button>
          </a-radio-group>
        </a-form-item> -->
        <a-form-item label="操作系统" v-bind="formItemLayout">
          <a-radio-group @change="osTypeChangeHandle" v-decorator="decorators.osType">
            <a-radio-button value="Linux">
              Linux
            </a-radio-button>
            <a-radio-button value="Windows">
              Windows Server
            </a-radio-button>
            <a-radio-button value="Other">
              其他
            </a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="发行版" v-bind="formItemLayout">
          <a-select placeholder="请选择发行版" v-decorator="decorators.osDistribution" @change="osDistributionChange">
            <a-select-option v-for="item in osNewDisOptions" :key="item.value" :value="item.value">
              {{item.text}}
            </a-select-option>
          </a-select>
          <a-input v-if="isDisOther" v-decorator="decorators.osOtherDistribution" placeholder="例如: CentOS" />
        </a-form-item>
        <a-form-item label="最小磁盘要求" v-bind="formItemLayout" v-if="!isHostImage">
          <a-input-number :min="1" :max="1000" :step="50" :precision="0" v-decorator="decorators.minDisk" /> GB
        </a-form-item>
        <a-form-item label="磁盘驱动" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.diskDriver">
            <a-radio-button v-for="(item, index) in diskDriverOptions" :value="item.value" :key="index">
              {{item.text}}
            </a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="网卡驱动" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.netDriver">
            <a-radio-button v-for="(item, index) in netDriverOptions" :value="item.value" :key="index">
              {{item.text}}
            </a-radio-button>
          </a-radio-group>
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

export default {
  name: 'ImageEditAttributesDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            initialValue: this.params.data[0].name,
            validateFirst: true,
            rules: [
              { required: true, message: '请输入镜像名称' },
              { validator: this.$validate('imageName') },
              { validator: this.checkTemplateName },
            ],
          },
        ],
        protected: [
          'protected',
          {
            initialValue: 'true',
          },
        ],
        osType: [
          'osType',
          {
            initialValue: 'Linux',
          },
        ],
        osDistribution: [
          'osDistribution',
          {
            initialValue: 'CentOS',
          },
        ],
        osOtherDistribution: [
          'osOtherDistribution',
        ],
        minDisk: [
          'minDisk',
          {
            initialValue: 1,
          },
        ],
        diskDriver: [
          'diskDriver',
        ],
        netDriver: [
          'netDriver',
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
      osDistributionOptions: {
        Windows: [
          { text: 'Windows Server 2008', value: 'Windows Server 2008' },
          { text: 'Windows Server 2008 R2', value: 'Windows Server 2008 R2' },
          { text: 'Windows Server 2012', value: 'Windows Server 2012' },
          { text: 'Windows Server 2012 R2', value: 'Windows Server 2012 R2' },
          { text: 'Windows Server 2016', value: 'Windows Server 2016' },
          { text: 'Windows Server 2019', value: 'Windows Server 2019' },
          { text: '其他', value: 'Other' },
        ],
        Linux: [
          { text: 'CentOS', value: 'CentOS' },
          { text: 'CoreOS', value: 'CoreOS' },
          { text: 'Debian', value: 'Debian' },
          { text: 'Fedora', value: 'Fedora' },
          { text: 'Gentoo', value: 'Gentoo' },
          { text: 'OpenSUSE', value: 'OpenSUSE' },
          { text: 'RedHat', value: 'RedHat' },
          { text: 'SUSE Linux', value: 'SUSE Linux' },
          { text: 'Ubuntu', value: 'Ubuntu' },
          { text: '其他', value: 'Other' },
        ],
        Other: [
          { text: '其他', value: 'Other' },
        ],
      },
      osNewDisOptions: [
        { text: 'CentOS', value: 'CentOS' },
        { text: 'CoreOS', value: 'CoreOS' },
        { text: 'Debian', value: 'Debian' },
        { text: 'Fedora', value: 'Fedora' },
        { text: 'Gentoo', value: 'Gentoo' },
        { text: 'OpenSUSE', value: 'OpenSUSE' },
        { text: 'RedHat', value: 'RedHat' },
        { text: 'SUSE Linux', value: 'SUSE Linux' },
        { text: 'Ubuntu', value: 'Ubuntu' },
        { text: '其他', value: 'Other' },
      ],
      isDisOther: false,
      initName: '',
      diskDriverOptions: [
        { text: '系统自动选择', value: '' },
        { text: 'virtio', value: 'virtio' },
        { text: 'scsi', value: 'scsi' },
        { text: 'pvscsi', value: 'pvscsi' },
        { text: 'ide', value: 'ide' },
        { text: 'sata', value: 'sata' },
      ],
      netDriverOptions: [
        { text: '系统自动选择', value: '' },
        { text: 'virtio', value: 'virtio' },
        { text: 'e1000', value: 'e1000' },
        { text: 'vmxnet3', value: 'vmxnet3' },
      ],
    }
  },
  computed: {
    isHostImage () {
      return this.params.data[0].root_image
    },
  },
  created () {
    this.fetchData()
  },
  methods: {
    fetchData () {
      this.manager = new this.$Manager(this.isHostImage ? 'guestimages' : 'images', 'v1')
      this.manager.get({ id: this.params.data[0].id })
        .then((res) => {
          const { name, min_disk: minDisk } = res.data
          const { os_type: osType, os_distribution: osDistribution, disk_driver: diskDriver, net_driver: netDriver } = res.data.properties
          this.initName = name
          this.$nextTick(() => {
            this.form.fc.setFieldsValue({
              name,
              minDisk: Math.round(minDisk / 1024),
              protected: res.data.protected + '',
              osType,
              osDistribution,
              diskDriver: diskDriver || '',
              netDriver: netDriver || '',
            })
          })
        })
    },
    checkTemplateName (rule, value, callback) {
      return new this.$Manager(this.isHostImage ? 'guestimages' : 'images', 'v1').list({
        params: {
          name: value,
        },
      }).then(res => {
        const data = res.data.data
        if (!R.isNil(data) && !R.isEmpty(data)) {
          if (data[0].name === this.initName) {
            callback()
          } else {
            callback(new Error('输入的镜像名称已存在'))
          }
        } else {
          callback()
        }
      })
    },
    osTypeChangeHandle (e) {
      const v = e.target.value
      this.osNewDisOptions = this.osDistributionOptions[v]
      if (v === 'Other') {
        this.form.fc.setFieldsValue({ osDistribution: 'Other' })
        this.isDisOther = true
      } else {
        this.form.fc.setFieldsValue({ osDistribution: this.osNewDisOptions[0].value })
        this.isDisOther = false
      }
    },
    osDistributionChange (e) {
      if (e === 'Other') {
        this.isDisOther = true
      } else {
        this.isDisOther = false
      }
    },
    doEdit (data) {
      return new this.$Manager(this.isHostImage ? 'guestimages' : 'images', 'v1').update({
        id: this.params.data[0].id,
        data,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const { name, osType, osDistribution, osOtherDistribution, minDisk, diskDriver, netDriver } = values
        const params = {
          name,
          // protected: values.protected,
          properties: {
            os_type: osType,
            os_distribution: this.isDisOther ? osOtherDistribution : osDistribution,
            disk_driver: diskDriver,
            net_driver: netDriver,
          },
        }
        if (!this.isHostImage) {
          params['min-disk'] = minDisk * 1024
        }
        await this.doEdit(params)
        this.loading = false
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
