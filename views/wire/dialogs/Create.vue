<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('network.text_696')}}</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item v-bind="formItemLayout" :label="$t('network.text_205', [$t('dictionary.domain')])" v-if="$store.getters.isAdminMode">
          <domain-select v-decorator="decorators.project_domain" />
        </a-form-item>
        <a-form-item :label="$t('network.text_21')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')"  />
        </a-form-item>
        <a-form-item label="VPC" v-bind="formItemLayout" :validateStatus="vpcValidateStatus" :help="vpcHelp" :required="true">
          <a-row :gutter="8">
            <a-col :span="12">
              <a-select
                v-decorator="decorators.area"
                @change="handleAreaChange"
                :placeholder="$t('network.text_199')">
                <a-select-option v-for="item in areas" :value="item.value" :key="item.value">
                  <span class="text-color-secondary option-prefix">{{ $t('network.text_199') }}:</span>
                  {{item.label}}
                </a-select-option>
              </a-select>
            </a-col>
            <a-col :span="12">
              <a-select
                  v-decorator="decorators.vpc"
                  placeholder="VPC">
                <a-select-option v-for="item in vpcs" :value="item.value" :key="item.value">
                  <span class="text-color-secondary option-prefix">VPC:</span>
                  {{item.label}}
                </a-select-option>
              </a-select>
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item :label="$t('network.text_24')" v-bind="formItemLayout">
          <a-select
            show-search
            :filterOption="filterOption"
            v-decorator="decorators.zone"
            :placeholder="$t('network.text_24')">
            <a-select-option v-for="item in zones" :value="item.value" :key="item.value">
              {{item.label}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('network.text_195')" v-bind="formItemLayout">
          <a-select
              v-decorator="decorators.bandwidth"
              :placeholder="$t('network.text_697')">
            <a-select-option v-for="item in bandwidthOptions" :value="item.value" :key="item.value">
              {{item.label}}
            </a-select-option>
          </a-select>
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
import { mapGetters } from 'vuex'
import { BAND_WIDTH_OPTION } from '../../../constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import DomainSelect from '@/sections/DomainSelect'

export default {
  name: 'WireCreateDialog',
  components: {
    DomainSelect,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    // 自定义校验名称重复
    const validateName = (rule, value, callback) => {
      // 编辑模式下不需要校验重复
      if (this.$route.query.id) {
        callback()
      }
      const wiresManager = new this.$Manager('wires')
      wiresManager.list({
        params: {
          filter: 'name.equals(' + value + ')',
        },
      })
        .then((res) => {
          const data = res.data.data
          if (data.length === 0) {
            callback()
          }
          callback(new Error(this.$t('network.text_698')))
        })
    }
    return {
      loading: false,
      vpcValidateStatus: '',
      vpcHelp: '',
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        area: [
          'area',
          {
            rules: [
              { required: true, message: this.$t('network.text_286') },
            ],
          },
        ],
        vpc: [
          'vpc',
          {
            rules: [
              { required: true, message: this.$t('network.text_274') },
            ],
          },
        ],
        zone: [
          'zone',
          {
            rules: [
              { required: true, message: this.$t('network.text_24') },
            ],
          },
        ],
        name: [
          'name',
          {
            initialValue: '',
            validateTrigger: ['change', 'blur'],
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_116') },
              { validator: this.$validate('resourceName') },
              { validator: validateName, trigger: ['blur'] },
            ],
          },
        ],
        bandwidth: [
          'bandwidth',
          {
            rules: [
              { required: true, message: this.$t('network.text_699') },
            ],
          },
        ],
        project_domain: [
          'project_domain',
          {
            initialValue: this.$store.getters.userInfo.projectDomainId,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      areas: [],
      vpcs: [],
      zones: [],
      bandwidthOptions: BAND_WIDTH_OPTION,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'userInfo']),
  },
  created () {
    this.fetchAreas()
    this.fetchZones()
  },
  methods: {
    fetchAreas () {
      const manager = new this.$Manager('cloudregions')
      manager.list({
        params: {
          is_on_premise: true,
        },
      }).then((res) => {
        this.areas = res.data.data.map((item) => {
          return {
            label: item.name,
            value: item.id,
          }
        })
        if (this.areas.length) {
          const defaultValue = this.areas[0].value
          this.form.fc.setFieldsValue({
            [this.decorators.area[0]]: defaultValue,
          })
          this.handleAreaChange(defaultValue)
        }
      })
    },
    fetchVpcs (area) {
      const manager = new this.$Manager('vpcs')
      const params = {
        cloudregion_id: area,
      }
      if (this.isAdminMode) {
        params.project_domain = this.userInfo.domain.id
      } else {
        params.scope = this.scope
      }
      manager.list({ params }).then((res) => {
        this.vpcs = res.data.data.map((item) => {
          return {
            label: item.name,
            value: item.id,
          }
        })
        if (area === 'default') this.vpcs = this.vpcs.filter(({ value }) => value === 'default')
        if (this.vpcs.length) {
          this.form.fc.setFieldsValue({
            [this.decorators.vpc[0]]: this.vpcs[0].value,
          })
        }
      })
    },
    fetchZones () {
      const manager = new this.$Manager('zones')
      manager.list({
        params: {
          is_on_premise: true,
        },
      }).then((res) => {
        this.loadZoneOptions(res.data.data)
      })
    },
    loadZoneOptions (data) {
      const results = []
      for (let i = 0; i < data.length; i++) {
        const zone = data[i]
        let name = zone.name
        if (zone.name_cn) {
          name += '(' + zone.name_cn + ')'
        }
        results.push({ label: name, value: zone.id })
      }
      this.zones = results
    },
    handleAreaChange (e) {
      this.fetchVpcs(e)
    },
    doCreate (data) {
      const params = {
        name: data.name,
        zone_id: data.zone,
        vpc_id: data.vpc,
        bandwidth: data.bandwidth,
      }
      return this.params.onManager('create', {
        managerArgs: {
          data: params,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        if (!this.form.fc.getFieldValue('area')) {
          this.vpcValidateStatus = 'error'
          this.vpcHelp = this.$t('network.text_286')
          this.loading = false
          return
        } else if (!this.form.fc.getFieldValue('vpc')) {
          this.vpcValidateStatus = 'error'
          this.vpcHelp = this.$t('network.text_274')
          this.loading = false
          return
        }
        this.vpcValidateStatus = ''
        this.vpcHelp = ''
        const values = await this.form.fc.validateFields()
        await this.doCreate(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
    filterOption (input, option) {
      const lastIdx = option.componentOptions.children.length - 1
      return (
        option.componentOptions.children[lastIdx].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
  },
}
</script>
