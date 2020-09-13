<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning" v-if="tips">
        <div slot="message">
          {{ tips }}
        </div>
      </a-alert>
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item v-show="!imgHidden" :label="$t('compute.text_267')">
          <div slot="help">
            <div class="help-color">{{$t('compute.text_302')}}</div>
          </div>
          <os-select
            :type="type"
            :form="form"
            :types="osSelectTypes"
            :hypervisor="hypervisor"
            :image-params="image"
            :ignoreOptions="ignoreImageOptions"
            :osType="osType"
            :cache-image-params="cacheImageParams"
            :decorator="decorators.imageOS"
            :sys-disk-size="sysDiskSize"
            :imageCloudproviderDisabled="true"
            :cloudproviderParamsExtra="cloudproviderParamsExtra"
            @updateImageMsg="updateImageMsgDebounce"
            :imageTypeMap="imageTypeMap"
            :edit="true" />
        </a-form-item>
        <a-form-item v-show="imgHidden" :label="$t('compute.text_267')">
          <div>{{ imgHidden.text }}</div>
        </a-form-item>
        <a-form-item :label="$t('compute.text_308')" v-if="!isZStack" class="mb-0">
          <server-password :decorator="decorators.loginConfig" :loginTypes="loginTypes" :form="form" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_494')" :extra="$t('compute.text_1220')">
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.autoStart" />
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
import _ from 'lodash'
import OsSelect from '@Compute/sections/OsSelect'
import ServerPassword from '@Compute/sections/ServerPassword'
import { SERVER_TYPE, LOGIN_TYPES_MAP } from '@Compute/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { HYPERVISORS_MAP } from '@/constants'
import { Manager } from '@/utils/manager'
import { IMAGES_TYPE_MAP } from '@/constants/compute'
import { isRequired, passwordValidator } from '@/utils/validate'
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
      action: this.$t('compute.text_357'),
      form: {
        fc: this.$form.createForm(this),
        fd: {},
      },
      image: {
        limit: 0,
        details: true,
        status: 'active',
      },
      ignoreImageOptions: [
        IMAGES_TYPE_MAP.iso.key,
        IMAGES_TYPE_MAP.host.key,
        IMAGES_TYPE_MAP.snapshot.key,
      ],
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      detailData: {},
      firstLoad: true,
      cloudproviderParamsExtra: {
        scope: this.$store.getters.scope,
        filter: `id.equals("${this.params.data[0].manager_id}")`,
      },
      imageTypeMap: {},
    }
  },
  computed: {
    type () {
      const brand = this.params.data[0].brand
      return findPlatform(brand)
    },
    osSelectTypes () {
      if (HYPERVISORS_MAP.ctyun.key === this.params.data[0].hypervisor) {
        return ['public', 'public_customize']
      }
      return []
    },
    imageType () {
      if (this.type === SERVER_TYPE.public) {
        return IMAGES_TYPE_MAP.public.key
      } else if (this.type === SERVER_TYPE.private) {
        return IMAGES_TYPE_MAP.private.key
      } else {
        return IMAGES_TYPE_MAP.standard.key
      }
    },
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
          prefer_manager: [
            'prefer_manager',
            {
              initialValue: _.get(this.params, 'data[0].manager_id') || '',
              rules: [
                { required: true, message: this.$t('compute.text_149') },
              ],
            },
          ],
          os: [
            'os',
            {
              initialValue: '',
              rules: [
                { required: !this.isZStack, message: this.$t('compute.text_153') },
              ],
            },
          ],
          image: [
            'image',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { validator: validateToImage(this.isZStack), message: this.$t('compute.text_214') },
              ],
            },
          ],
          imageType: [
            'imageType',
            {
              initialValue: this.imageType,
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
              initialValue: undefined,
              rules: [
                { required: true, message: this.$t('compute.text_203') },
              ],
            },
          ],
          password: [
            'loginPassword',
            {
              initialValue: '',
              rules: [
                { required: true, message: this.$t('compute.text_204') },
                { validator: passwordValidator, trigger: 'blur' },
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
    cacheImageParams () {
      const params = {
        details: false,
        order_by: 'ref_count',
        order: 'desc',
        zone: this.params.data[0].zone_id,
      }
      if (this.hypervisor === HYPERVISORS_MAP.esxi.key) {
        params.image_type = 'system'
      }
      return params
    },
    isFreezeImg () {
      // if (this.hypervisor) {
      //   return [HYPERVISORS_MAP.openstack.key].includes(this.hypervisor.toLowerCase())
      // }
      return false
    },
    imgHidden () {
      if (this.hypervisor) {
        if (this.isFreezeImg) {
          const pdata = this.detailData[0]
          if (pdata && pdata.disks_info && pdata.disks_info[0] && pdata.disks_info[0].image) {
            return {
              text: pdata.disks_info[0].image,
              isImage: true,
            }
          } else {
            return {
              text: this.$t('compute.text_1221'),
              isImage: false,
            }
          }
        } else {
          return false
        }
      }
      return false
    },
    tips () {
      if (this.hypervisor === HYPERVISORS_MAP.openstack.key) {
        return this.$t('compute.text_1222')
      }
      if (this.hypervisor === HYPERVISORS_MAP.zstack.key) {
        return this.$t('compute.text_1223')
      }
      if (this.params.data.length === 1) {
        return this.$t('compute.text_1224')
      }
      return ''
    },
    osType () {
      return this.params.data[0].os_type
    },
    loginTypes () {
      const loginTypes = { ...LOGIN_TYPES_MAP }
      const hypervisor = this.hypervisor
      if (HYPERVISORS_MAP.ucloud.key === hypervisor) {
        delete loginTypes[LOGIN_TYPES_MAP.image.key]
        delete loginTypes[LOGIN_TYPES_MAP.keypair.key]
      }
      if (HYPERVISORS_MAP.aws.key === hypervisor) {
        delete loginTypes[LOGIN_TYPES_MAP.random.key]
        delete loginTypes[LOGIN_TYPES_MAP.password.key]
      }
      if ([HYPERVISORS_MAP.azure.key, HYPERVISORS_MAP.huawei.key].includes(hypervisor)) {
        delete loginTypes[LOGIN_TYPES_MAP.image.key]
      }
      if (HYPERVISORS_MAP.ctyun.key === hypervisor) {
        delete loginTypes[LOGIN_TYPES_MAP.keypair.key]
        delete loginTypes[LOGIN_TYPES_MAP.image.key]
      }
      if (HYPERVISORS_MAP.google.key === hypervisor) {
        delete loginTypes[LOGIN_TYPES_MAP.image.key]
      }
      if (HYPERVISORS_MAP.qcloud.key === hypervisor) {
        delete loginTypes[LOGIN_TYPES_MAP.image.key]
      }
      if (this.osType === 'Windows') {
        // 以下平台在选择 windows 镜像时禁用关联密钥
        const disableKeypairHyper = [
          HYPERVISORS_MAP.azure.key,
          HYPERVISORS_MAP.aliyun.key,
          HYPERVISORS_MAP.qcloud.key,
          HYPERVISORS_MAP.esxi.key,
        ]
        if (disableKeypairHyper.includes(hypervisor)) {
          delete loginTypes[LOGIN_TYPES_MAP.keypair.key]
        }
      }
      return Object.keys(loginTypes)
    },
    sysDiskSize () {
      if (this.detailData.length === 1) {
        const diskInfos = this.detailData[0].disks_info
        const sysDisk = diskInfos.find((item) => { return item.disk_type === 'sys' || item.index === 0 })
        if (sysDisk) {
          return sysDisk.size
        }
      }
      return 0
    },
  },
  // watch: {
  //   type: {
  //     handler (val) {
  //       if (val === SERVER_TYPE.public) {
  //         this.$nextTick(() => {
  //           this.form.fc.setFieldsValue({ 'imageType': IMAGES_TYPE_MAP.public.key })
  //         })
  //       }
  //     },
  //     immediate: true,
  //   },
  // },
  created () {
    this.serversManager = new Manager('servers', 'v2')
    this.fetchData()
    this.updateImageMsgDebounce = _.debounce(this.updateImageMsg, 600)
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
      // if (this.isZStack) {
      //   params.image_id = this.detailData[0].disks_info[0].image_id
      // }
      if (loginType === 'keypair') {
        params.keypair = loginKeypair
        params.reset_password = false
      } else if (loginType === 'image') {
        params.reset_password = false // 如果登录方式为创建后设置, 则增加参数 reset_password = false
      } else if (loginType === 'password') {
        params.password = loginPassword
      }
      if (this.isZStack) {
        params.reset_password = false
      }
      return this.params.onManager('batchPerformAction', {
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
    fetchData () {
      const ids = []
      this.params.data.forEach((item) => {
        ids.push(item.id)
      })
      this.fetchdone = false
      this.serversManager.batchGet({ id: ids })
        .then((res) => {
          this.fetchdone = true
          this.detailData = res.data.data
          this.$set(this.form.fd, 'vmem', _.get(res.data, 'data[0].vmem_size'))
          this.setImageTypeMap(this.detailData)
        })
        .catch(() => {
          this.fetchdone = true
        })
    },
    setImageTypeMap (serverlist) {
      const firstManagerId = serverlist[0].manager_id
      if (serverlist.some(val => val.manager_id !== firstManagerId)) { // 说明多台主机是不在同一个订阅下
        this.imageTypeMap = {
          public_customize: {
            ...IMAGES_TYPE_MAP.public_customize,
            disabled: true,
            tooltip: this.$t('compute.text_1225', [this.$t('dictionary.server'), IMAGES_TYPE_MAP.public_customize.label]),
          },
        }
      }
    },
    updateImageMsg (imageMsg) {
      if (this.firstLoad) {
        const detailData = this.detailData || []
        const diskInfo = (detailData[0] && detailData[0].disks_info) || []
        if (diskInfo.length > 0) {
          const image = diskInfo[0] || {}
          if (imageMsg.name !== image.image) return
          if (!image.image_id) return
          this.$nextTick(() => {
            this.form.fc.setFieldsValue({
              image: {
                key: image.image_id,
                label: image.image || '',
              },
            })
          })
        }
        this.firstLoad = false
      }
    },
  },
}
</script>
