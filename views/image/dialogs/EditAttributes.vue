<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_247')}}</div>
    <div slot="body">
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item :label="$t('compute.text_228')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :plcaeholder="$t('compute.text_627')" />
        </a-form-item>
        <!-- <a-form-item :label="$t('compute.text_372')" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.protected">
            <a-radio-button value="true">{{$t('compute.text_656')}}</a-radio-button>
            <a-radio-button value="false">{{$t('compute.text_569')}}</a-radio-button>
          </a-radio-group>
        </a-form-item> -->
        <a-form-item :label="$t('compute.text_1365')">
          <os-arch
            v-decorator="decorators.os_arch"
            :form="form" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_267')" v-bind="formItemLayout">
          <a-radio-group @change="osTypeChangeHandle" v-decorator="decorators.osType">
            <a-radio-button value="Linux">
              Linux
            </a-radio-button>
            <a-radio-button value="Windows">
              Windows Server
            </a-radio-button>
            <a-radio-button value="Other">{{$t('compute.text_151')}}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('compute.text_657')" v-bind="formItemLayout">
          <a-select :placeholder="$t('compute.text_658')" v-decorator="decorators.osDistribution" @change="osDistributionChange">
            <a-select-option v-for="item in osNewDisOptions" :key="item.value" :value="item.value">
              {{item.text}}
            </a-select-option>
          </a-select>
          <a-input v-if="isDisOther" v-decorator="decorators.osOtherDistribution" :placeholder="$t('compute.text_659')" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_633')" v-bind="formItemLayout" v-if="!isHostImage">
          <a-input-number :min="1" :max="1000" :step="50" :precision="0" v-decorator="decorators.minDisk" /> GB
        </a-form-item>
        <a-form-item :label="$t('compute.text_634')" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.diskDriver">
            <a-radio-button v-for="(item, index) in diskDriverOptions" :value="item.value" :key="index">
              {{item.text}}
            </a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('compute.text_635')" v-bind="formItemLayout">
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
import _ from 'lodash'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import OsArch from '@/sections/OsArch'
import { HOST_CPU_ARCHS } from '@/constants/compute'

export default {
  name: 'ImageEditAttributesDialog',
  components: {
    OsArch,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const os_arch = _.get(this.params.data, '[0].os_arch').includes('x86') ? HOST_CPU_ARCHS.x86.key : HOST_CPU_ARCHS.arm.key
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
              { required: true, message: this.$t('compute.text_660') },
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
        os_arch: [
          'os_arch',
          {
            initialValue: os_arch,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 17,
        },
        labelCol: {
          span: 7,
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
          { text: this.$t('compute.text_151'), value: 'Other' },
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
          { text: this.$t('compute.text_151'), value: 'Other' },
        ],
        Other: [
          { text: this.$t('compute.text_151'), value: 'Other' },
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
        { text: this.$t('compute.text_151'), value: 'Other' },
      ],
      isDisOther: false,
      initName: '',
      diskDriverOptions: [
        { text: this.$t('compute.text_661'), value: '' },
        { text: 'virtio', value: 'virtio' },
        { text: 'scsi', value: 'scsi' },
        { text: 'pvscsi', value: 'pvscsi' },
        { text: 'ide', value: 'ide' },
        { text: 'sata', value: 'sata' },
      ],
      netDriverOptions: [
        { text: this.$t('compute.text_661'), value: '' },
        { text: 'virtio', value: 'virtio' },
        { text: 'e1000', value: 'e1000' },
        { text: 'vmxnet3', value: 'vmxnet3' },
      ],
      initMinDisk: 0,
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
          this.initMinDisk = minDisk
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
            callback(new Error(this.$t('compute.text_662')))
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
        const { name, osType, osDistribution, osOtherDistribution, minDisk, diskDriver, netDriver, os_arch } = values
        const params = {
          name,
          // protected: values.protected,
          os_arch,
          properties: {
            os_type: osType,
            os_distribution: this.isDisOther ? osOtherDistribution : osDistribution,
            disk_driver: diskDriver,
            net_driver: netDriver,
            os_arch,
          },
        }
        if (!this.isHostImage) {
          params['min-disk'] = minDisk * 1024
          if (params['min-disk'] === 0) { // 说明上传了一个小于1G的镜像,被四舍五入成0了，要取源数据
            params['min-disk'] = this.initMinDisk
          }
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
