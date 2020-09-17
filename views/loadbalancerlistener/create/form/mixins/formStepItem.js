import * as R from 'ramda'
import { getDecorators } from '../utils'
import ListenerTypes from '@Network/views/loadbalancerlistener/components/ListenerTypes'
import SchedulerTypes from '@Network/views/loadbalancerlistener/components/SchedulerTypes'
import { schedulerProviderMaps, healthCheckTypeProviderMaps, healthCheckHttpCodeOpts } from '@Network/views/loadbalancerlistener/constants'
import StickySession from '@Network/views/loadbalancerlistener/components/StickySession'
import Acl from '@Network/views/loadbalancerlistener/components/Acl'
import { getInitialValue } from '@/utils/common/ant'
import NameRepeated from '@/sections/NameRepeated'
import { HYPERVISORS_MAP } from '@/constants'
import i18n from '@/locales'

export default {
  components: {
    NameRepeated,
    ListenerTypes,
    SchedulerTypes,
    StickySession,
    Acl,
  },
  props: {
    lbDetail: {
      type: Object,
      required: true,
    },
    allFd: {
      type: Object,
      required: true,
    },
    listenerData: {
      type: Object,
    },
    isUpdate: {
      type: Boolean,
      default: false,
    },
    currentComponent: {
      type: String,
      required: true,
    },
  },
  computed: {
    certificateParams () {
      const params = {
        usable: true,
        scope: this.$scope,
        limit: 0,
        cloudregion: this.lbDetail.cloudregion_id,
        manager: this.lbDetail.manager_id,
      }
      return params
    },
    schedulerTypeOpts () {
      let type = this.lbDetail.brand.toLowerCase()
      if (type) {
        if (type === 'aws') type = `${type}_${this.lbDetail.loadbalancer_spec}`
        return schedulerProviderMaps[type.toLowerCase()]
      }
      return []
    },
    healthCheckTypeOpts () {
      let type = this.lbDetail.brand.toLowerCase()
      if (type) {
        if (type === 'aws') type = `${type}_${this.lbDetail.loadbalancer_spec}`
        return healthCheckTypeProviderMaps[type.toLowerCase()]
      }
      return []
    },
    healthCheckHttpCodeOpts () {
      let type = this.lbDetail.brand.toLowerCase()
      if (type) {
        if (type === 'aws') type = `${type}_${this.lbDetail.loadbalancer_spec}`
        return healthCheckHttpCodeOpts[type.toLowerCase()] || healthCheckHttpCodeOpts.default
      }
      return []
    },
    backendgroupParams () {
      const params = {
        loadbalancer: this.lbDetail.id,
        scope: this.$store.getters.scope,
        status: 'enabled',
      }
      if (this.lbDetail.provider === HYPERVISORS_MAP.aliyun.provider) {
        params['filter.0'] = 'type.notequals("default")'
        params.type = 'normal'
      }
      return params
    },
  },
  data () {
    let type = this.lbDetail.brand.toLowerCase()
    const loadbalancer = this.lbDetail.id
    if (type === 'aws') type = `${type}_${this.lbDetail.loadbalancer_spec}`
    const decorators = getDecorators({ provider: type, vm: this, loadbalancer })
    const initFd = getInitialValue(decorators)
    return {
      form: {
        fc: this.$form.createForm(this, { onValuesChange: this.onValuesChange }),
        fd: initFd,
      },
      decorators,
      formItemLayout: {
        wrapperCol: {
          span: 16,
        },
        labelCol: {
          span: 8,
        },
      },
      backendgroup: {},
      backendList: [],
      backendColumns: [
        {
          field: 'name',
          title: i18n.t('network.text_433'),
          minWidth: '30%',
        },
        {
          field: 'address',
          title: i18n.t('network.text_213'),
        },
        {
          field: 'port',
          title: i18n.t('network.text_165'),
        },
        {
          field: 'weight',
          title: i18n.t('network.text_166'),
        },
      ],
    }
  },
  mounted () {
    if (this.isUpdate) {
      this.rollbackForm()
      if (this.$refs.backendgroupsRef) {
        this.$refs.backendgroupsRef.change(this.listenerData.backend_group_id)
      }
    }
  },
  methods: {
    openBackendgroupsCreate () {
      this.createDialog('LoadbalancerbackendgroupsCreateDialog', {
        title: i18n.t('network.text_434'),
        loadbalancer: this.lbDetail.id,
        onManager: this.onManager,
        refresh: async () => {
          const vnode = this.$refs.backendgroupsRef
          if (vnode && vnode.loadOpts) {
            const retList = await vnode.loadOpts()
            if (retList && retList.length > 0) {
              const backend_group = retList[0].id
              this.form.fc.setFieldsValue({
                backend_group,
              })
              this.fetchBackendList(backend_group)
            }
          }
        },
      })
    },
    async onValuesChange (props, values) {
      R.forEachObjIndexed((value, key) => {
        this.$set(this.form.fd, key, value)
      }, values)
      await this.$nextTick()
      const redirectKeys = ['redirect', 'redirect_scheme', 'redirect_host', 'redirect_path', 'listener_type']
      if (redirectKeys.indexOf(Object.keys(values)[0]) > -1) {
        this.form.fc.resetFields(['check'])
        this.form.fc.validateFields(['check'])
      }
    },
    healthCheckChange (val) {
      if (val) {
        this.setDefaultHealthCheckType(this.healthCheckTypeOpts)
      }
    },
    setDefaultHealthCheckType (HealthCheckTypeOpts) {
      const { health_check_type } = this.form.fc.getFieldsValue([this.decorators.health_check_type[0]])
      if (!HealthCheckTypeOpts.find(v => v.key === health_check_type)) {
        this.form.fc.setFieldsValue({
          [this.decorators.health_check_type[0]]: HealthCheckTypeOpts[0].key,
        })
      }
    },
    async fetchBackendList (bgId) {
      try {
        const { data: { data = [] } } = await new this.$Manager('loadbalancerbackends')
          .list({
            params: {
              backend_group: bgId,
              details: true,
              scope: this.$store.getters.scope,
            },
          })
        this.backendList = data
      } catch (error) {
        throw error
      }
    },
    rollbackForm () {
      const updateData = {}
      const needTurnBool = ['acl_status', 'health_check', 'sticky_session']
      const updateFieldMap = { // 后端返回数据和前端请求数据不一致，这里做字段映射
        [this.decorators.certificate[0]]: 'certificate_id',
        [this.decorators.acl[0]]: 'acl_id',
        [this.decorators.generate_name[0]]: 'name',
        [this.decorators.backend_group[0]]: 'backend_group_id',
      }
      R.forEachObjIndexed(value => {
        const key = value[0]
        if (needTurnBool.includes(key)) {
          updateData[key] = (this.listenerData[key] === 'on')
        } else if (key === 'health_check_http_code' && R.is(String, this.listenerData[key])) {
          updateData[key] = this.listenerData[key].split(',')
        } else if (updateFieldMap[key]) {
          updateData[key] = this.listenerData[updateFieldMap[key]]
        } else if (key === 'redirect') {
          updateData[key] = (this.listenerData[key] === 'raw')
        } else {
          updateData[key] = this.listenerData[key]
        }
        this.form.fc.getFieldDecorator(key, value[1])
      }, this.decorators)
      this.$nextTick(() => {
        this.form.fc.setFieldsValue(updateData)
        this.$nextTick(() => { // 让有条件渲染的表单项重新赋值，如 证书、重写cookie 等
          // this.form.fc.getFieldDecorator('scheduler', this.decorators.scheduler[1])
          this.form.fc.setFieldsValue(updateData)
        })
      })
      if (this.currentComponent === 'Protocol') { // 仅在第一步进行allFd的同步，防止已经更改第一步数据后进入第二步时allFd再次呗初始化
        this.$emit('update:allFd', updateData)
      }
      if (this.currentComponent === 'Backendgroup') {
        this.fetchBackendList(this.listenerData.backend_group_id)
      }
    },
  },
}
