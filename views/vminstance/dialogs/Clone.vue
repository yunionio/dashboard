<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">创建相同配置</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="创建相同配置" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item label="名称" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')"  @change="debounceFetchServers" />
          <template v-slot:extra>
            <div>名称支持有序后缀占位符‘#’，用法举例，名称host##，数量2，创建后实例的名称依次为host01、host02，已有同名实例，序号顺延</div>
            <div class="mt-2" v-if="nameRepeated">名称重复，系统默认追加“-1”</div>
          </template>
        </a-form-item>
        <a-form-item label="数量" v-bind="formItemLayout">
          <a-input-number v-decorator="decorators.__count__" :min="1" :max="10" :step="1" :parser="Math.round" />
        </a-form-item>
        <a-form-item label="操作系统" v-bind="formItemLayout" v-if="isPublic">
          <os-select
            :type="type"
            :osType="osType"
            :hypervisor="firstData.hypervisor"
            :image-params="imageParams"
            :cache-image-params="cacheImageParams"
            :decorator="decorators.imageOS" />
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
import { mapGetters } from 'vuex'
import debounce from 'lodash/debounce'
import { SERVER_TYPE } from '@Compute/constants'
import OsSelect from '@Compute/sections/OsSelect'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import WorkflowMixin from '@/mixins/workflow'
import { findPlatform } from '@/utils/common/hypervisor'
import { IMAGES_TYPE_MAP } from '@/constants/compute'

export default {
  name: 'VmCloneDialog',
  components: {
    OsSelect,
  },
  mixins: [DialogMixin, WindowsMixin, WorkflowMixin],
  provide () {
    return {
      form: this.form,
    }
  },
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            if (values.hasOwnProperty('imageType')) {
              this.form.fi.imageType = values.imageType
            }
          },
        }),
        fi: {
          generate_name: '',
          imageType: IMAGES_TYPE_MAP.public.key,
        },
        fd: {},
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入名称' },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        __count__: [
          '__count__',
          {
            initialValue: 1,
            rules: [
              { required: true, message: '请选择数量' },
            ],
          },
        ],
        imageOS: {
          os: [
            'os',
            {
              rules: [
                { required: true, message: '请选择操作系统' },
              ],
            },
          ],
          image: [
            'image',
            {
              rules: [
                { required: true, message: '请选择镜像' },
              ],
            },
          ],
          imageType: [
            'imageType',
            {
              initialValue: IMAGES_TYPE_MAP.public.key,
            },
          ],
        },
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      servers: [],
      createParams: {},
      specificationList: [],
    }
  },
  computed: {
    ...mapGetters(['scope', 'userInfo']),
    firstData () {
      return this.params.data[0]
    },
    nameRepeated () {
      return !!this.servers.find(item => item.name === this.form.fi.generate_name)
    },
    type () {
      return findPlatform(this.firstData.hypervisor)
    },
    isPublic () {
      return this.type === SERVER_TYPE.public
    },
    imageParams () {
      const params = {
        status: 'active',
        details: true,
        limit: 0,
        'filter.0': 'disk_format.notequals(iso)',
        scope: this.scope,
        is_standard: true,
      }
      if (this.form.fi.imageType === IMAGES_TYPE_MAP.standard.key) {
        return params
      }
      if (this.form.fi.imageType === IMAGES_TYPE_MAP.customize.key) {
        params.is_standard = false
        return params
      }
      return params
    },
    cacheImageParams () {
      const params = {
        details: false,
        order_by: 'ref_count',
        order: 'desc',
        zone: this.firstData.zone_id,
      }
      return params
    },
    osType () {
      return this.params.data[0].os_type
    },
  },
  destroyed () {
    this.debounceFetchServers = null
  },
  created () {
    this.manager = new this.$Manager('servers')
    this.debounceFetchServers = debounce(e => {
      this.form.fi.generate_name = e.target.value
      this.fetchServers(e.target.value)
    }, 300)
    this.fetchServerCreateParams()
    if (this.params.type === 'baremetal') {
      this.fetchHosts()
    }
  },
  methods: {
    async fetchServerCreateParams () {
      const params = {
        id: this.firstData.id,
        spec: 'create-params',
      }
      try {
        const response = await this.manager.getSpecific(params)
        const data = response.data || {}
        this.createParams = data
      } catch (error) {
        throw error
      }
    },
    async fetchServers (name) {
      let manager = new this.$Manager('servers')
      const params = {
        filter: `name.contains("${name}")`,
      }
      try {
        const response = await manager.list({ params })
        const data = response.data.data || []
        this.servers = data
      } catch (error) {
        this.servers = []
        throw error
      } finally {
        manager = null
      }
    },
    async fetchHosts () {
      new this.$Manager('hosts').list({
        params: {
          enabled: 1,
          usable: true,
          is_empty: true,
          host_type: 'baremetal',
          scope: this.$store.getters.scope,
        },
      }).then(({ data = {} }) => {
        if (data.data.length) {
          this.specificationList = data.data
        }
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const data = this.genCloneData(values)
        if (this.params.type === 'baremetal') {
          if (this.specificationList.length) {
            this.$message.warning('无可用规格，无法创建')
            return
          } else {
            const specificationItem = this.specificationList.filter(item => { return item.id === data.host_id })
            if (R.isEmpty(specificationItem.spec) || R.isNil(specificationItem.spec)) {
              this.$message.warning('无相同规格，无法创建')
              return
            }
          }
        }
        const schedulerManager = new this.$Manager('schedulers', 'v1')
        const schedulerReponse = await schedulerManager.rpc({
          methodname: 'DoForecast',
          params: data,
        })
        if (!schedulerReponse.data.can_create) {
          this.$message.warning('资源不满足条件，无法创建相同配置的机器')
          return
        }
        if (this.checkWorkflowEnabled(this.WORKFLOW_TYPES.APPLY_MACHINE)) {
          let variables = {
            process_definition_key: this.WORKFLOW_TYPES.APPLY_MACHINE,
            initiator: this.userInfo.id,
            'server-create-paramter': JSON.stringify(data),
          }
          await this.createWorkflow(variables)
          this.$message.success(`主机 ${data.name} 创建请求流程已提交`)
          this.$router.push('/workflow?type=me-process')
        } else {
          await this.params.list.onManager('create', {
            managerArgs: {
              data,
            },
          })
        }
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
    genCloneData (fd) {
      const server = {
        ...this.createParams,
        __count__: fd.__count__,
        name: fd.name,
        generate_name: fd.name,
      }
      if (this.isPublic) {
        server.disks[0].image_id = fd.image.key
        server.imageType = fd.imageType
      }
      return server
    },
  },
}
</script>
