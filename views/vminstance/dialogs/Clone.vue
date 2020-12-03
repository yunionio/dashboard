<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_359')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.text_359')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_228')">
          <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceCreateName')"  @change="e => { form.fi.generate_name = e.target.value }" />
          <template #extra>
            <name-repeated
              res="servers"
              :name="form.fi.generate_name"
              :default-text="$t('compute.text_893')" />
          </template>
        </a-form-item>
        <a-form-item :label="$t('compute.text_294')">
          <a-input-number v-decorator="decorators.__count__" :min="1" :max="10" :step="1" :parser="Math.round" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_267')" v-if="isPublic">
          <os-select
            :type="type"
            :form="form"
            :types="osTypes"
            :osType="osType"
            :hypervisor="firstData.hypervisor"
            :image-params="imageParams"
            :cache-image-params="cacheImageParams"
            :cloudproviderParamsExtra="cloudproviderParamsExtra"
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
import _ from 'lodash'
import { mapGetters } from 'vuex'
import { SERVER_TYPE } from '@Compute/constants'
import OsSelect from '@Compute/sections/OsSelect'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import WorkflowMixin from '@/mixins/workflow'
import { findPlatform } from '@/utils/common/hypervisor'
import { IMAGES_TYPE_MAP } from '@/constants/compute'
import NameRepeated from '@/sections/NameRepeated'
import { HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'VmCloneDialog',
  components: {
    OsSelect,
    NameRepeated,
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
              { required: true, message: this.$t('compute.text_210') },
              { validator: this.$validate('resourceCreateName') },
            ],
          },
        ],
        __count__: [
          '__count__',
          {
            initialValue: 1,
            rules: [
              { required: true, message: this.$t('compute.text_1195') },
            ],
          },
        ],
        imageOS: {
          prefer_manager: [
            'prefer_manager',
            {
              rules: [
                { required: true, message: this.$t('compute.text_149') },
              ],
            },
          ],
          os: [
            'os',
            {
              rules: [
                { required: true, message: this.$t('compute.text_153') },
              ],
            },
          ],
          image: [
            'image',
            {
              rules: [
                { required: true, message: this.$t('compute.text_214') },
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
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      servers: [],
      createParams: {},
      specificationList: [],
      cloudproviderParamsExtra: {
        provider: _.get(this.params, 'data[0].provider'),
      },
    }
  },
  computed: {
    ...mapGetters(['scope', 'isAdminMode', 'userInfo']),
    firstData () {
      return this.params.data[0]
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
    osTypes () {
      if (HYPERVISORS_MAP.ctyun.key === this.firstData.hypervisor) {
        return ['public', 'public_customize']
      }
      return []
    },
  },
  created () {
    this.manager = new this.$Manager('servers')
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
            this.$message.warning(this.$t('compute.text_1196'))
            return
          } else {
            const specificationItem = this.specificationList.filter(item => { return item.id === data.host_id })
            if (R.isEmpty(specificationItem.spec) || R.isNil(specificationItem.spec)) {
              this.$message.warning(this.$t('compute.text_1197'))
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
          this.$message.warning(this.$t('compute.text_1198'))
          return
        }
        if (this.checkWorkflowEnabled(this.WORKFLOW_TYPES.APPLY_MACHINE)) {
          const variables = {
            process_definition_key: this.WORKFLOW_TYPES.APPLY_MACHINE,
            initiator: this.userInfo.id,
            'server-create-paramter': JSON.stringify(data),
          }
          await this.createWorkflow(variables)
          this.$message.success(this.$t('compute.text_1045', [data.name]))
          this.$router.push('/workflow')
        } else {
          await this.params.onManager('create', {
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
        ...this.generateCreateParams(this.createParams, fd),
        __count__: fd.__count__,
        name: fd.name,
        generate_name: fd.name,
      }
      const disks = this.createParams.disks
      if (disks && disks.length > 0) {
        disks.forEach((disk) => {
          if (disk.disk_type === 'data') {
            delete disk.image_id
          }
        })
      }
      delete server.eip
      if (this.isPublic) {
        server.disks[0].image_id = fd.image.key
        server.imageType = fd.imageType
        server.prefer_manager = fd.prefer_manager
      }
      return server
    },
    generateCreateParams (createParams, fd) {
      const delProps = ['domain', 'domain_id', 'project', 'project_domain', 'project_domain_id', 'project_id', 'tenant', 'tenant_id']
      delProps.forEach(v => {
        delete createParams[v]
      })
      createParams.project_id = this.params.data[0].tenant_id
      return createParams
    },
  },
}
</script>
