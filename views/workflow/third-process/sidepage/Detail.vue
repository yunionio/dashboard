<template>
  <div>
    <detail
      :onManager="onManager"
      :data="detailsData"
      :hiddenKeys="['updated_at', 'description']"
      :show-desc="false"
      :base-info="baseInfo"
      :extra-info="extraInfo" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import serverConfMixin from '@/views/workflow/mixins/serverConf'
import ProjectQuotaMixin from '@/views/workflow/mixins/projectQuota'
import DomainQuotaMixin from '@/views/workflow/mixins/domainQuota'
import PriceMixin from '@/views/workflow/mixins/price'
import ProcessHistory from '@/views/workflow/components/ProcessHistory'
import ProcessList from '@/views/workflow/components/ProcessList'
import ServerConfigList from '@/views/workflow/components/ServerConfig'
import DeleteServers from '@/views/workflow/components/DeleteServers'
import {
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import { getWorkflowType, WORKFLOW_TYPES } from '@/constants/workflow'
import { HYPERVISORS_GROUP } from '@/constants'

export default {
  name: 'ThirdProcessDetail',
  mixins: [serverConfMixin, ProjectQuotaMixin, DomainQuotaMixin, PriceMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      loaded: false,
      allPublic: HYPERVISORS_GROUP.public,
      configData: {},
      skuInfo: {},
      regionInfo: {},
      zoneInfo: {},
      detailsData: { ...this.data, domainQuota: {}, projectQuota: {} },
      processInstanceInfo: {},
      deleteServers: [],
      processList: [],
      baseInfo: [
        {
          field: 'status',
          title: '状态',
          formatter: ({ cellValue, row }) => {
            return this.data.status || '-'
          },
        },
        {
          field: 'project',
          title: '项目',
          formatter: ({ cellValue, row }) => {
            return this.variables.resource_project_name || '-'
          },
        },
        {
          field: 'initiator_name',
          title: '申请人',
          formatter: ({ cellValue, row }) => {
            return this.data.start_user_name || '-'
          },
        },
        {
          field: 'process_definition_key',
          title: '工单类型',
          formatter: ({ cellValue, row }) => {
            const pdk = this.variables.process_definition_key || this.process_definition_key
            const objType = getWorkflowType(pdk)
            return (objType && objType.name) || '-'
          },
        },
        getTimeTableColumn({ field: 'created_at', title: '创建日期' }),
        getTimeTableColumn({ field: 'end_at', title: '结束日期' }),
      ],
      extraInfo: [],
    }
  },
  computed: {
    ...mapGetters(['isDomainMode', 'isAdminMode']),
    variables () {
      return JSON.parse(this.data.variables || '{}')
    },
    proccessDefinitionKey () {
      return this.variables.process_definition_key || this.variables.process_instance.process_definition_key
    },
    paramter () {
      if (this.variables.paramter) {
        return JSON.parse(this.variables.paramter || '{}')
      }
      return {}
    },
  },
  created () {
  },
  methods: {
    initServerConfigInfo () {
      const serverConfigs = JSON.parse(this.variables.serverConf || '[]')
      const serverConfList = {
        title: '配置调整情况',
        field: 'serverConfList',
        slots: {
          default: ({ row }, h) => {
            return [
              <ServerConfigList serverConfigs={ serverConfigs } />,
            ]
          },
        },
      }
      this.extraInfo.push(serverConfList)
    },
    initProcessInstanceInfo () {
      this.getProcessInstance(this.data.process_instance_id || this.data.id)
        .then((res) => {
          const pInfo = res.data || {}
          this.getProcessInstanceData(pInfo)
          this.initProcessHistorys()
          this.initProcessList()
          this.loaded = true
        })
        .catch(() => {
          this.loaded = true
        })
    },
    getProcessInstanceData (processInstanceInfo) {
      if (this.proccessDefinitionKey !== WORKFLOW_TYPES.CUSTOMER_SERVICE) {
        processInstanceInfo.log.unshift({
          activity_name: '提交工单',
          task_assignee_name: processInstanceInfo.variables && processInstanceInfo.variables.initiator_name,
          end_time: processInstanceInfo.start_time,
          task: {
            local_variables: {
              comment: processInstanceInfo.variables.description,
            },
            // comments: [{ full_message: processInstanceInfo.variables.description }]
          },
        })
      }
      this.processInstanceInfo = processInstanceInfo
      const processList = []
      processInstanceInfo.definition.forEach((item) => {
        processList.push({
          title: item.activity_name,
          assignees: item.activity_instance.map((v) => {
            return v.task_assignee_name
          }),
        })
      })
      if (this.proccessDefinitionKey === WORKFLOW_TYPES.APPLY_MACHINE || this.proccessDefinitionKey === WORKFLOW_TYPES.APPLY_SERVER_CHANGECONFIG) {
        processList.push({
          title: '部署',
          assignees: ['自动部署'],
        })
      }
      this.processList = processList
    },
    initProcessHistorys () {
      const processHistory = {
        title: '处理记录',
        field: 'processHistory',
        slots: {
          default: ({ row }, h) => {
            return [
              <ProcessHistory processInstanceInfo={ this.processInstanceInfo } />,
            ]
          },
        },
      }
      this.extraInfo.push(processHistory)
    },
    initProcessList () {
      this.processList.unshift({
        title: '提交工单',
        assignees: this.processInstanceInfo.variables && this.processInstanceInfo.variables.initiator_name,
      })
      const processList = {
        title: '审批流程',
        field: 'processList',
        slots: {
          default: ({ row }, h) => {
            return [
              <ProcessList processList={ this.processList } />,
            ]
          },
        },
      }
      this.extraInfo.push(processList)
    },
    initProjectInfo () {
      const variables = this.data.variables
      const projectInfo = [
        {
          title: `申请${this.$t('dictionary.project')}情况`,
          items: [
            {
              field: 'description',
              title: '备注',
              formatter: ({ cellValue, row }) => {
                return variables.description || '-'
              },
            },
            {
              field: 'project',
              title: '加入项目',
              formatter: ({ cellValue, row }) => {
                return variables.joinProjectName || '-'
              },
            },
          ],
        },
      ]
      this.extraInfo.push(...projectInfo)
    },
    initDeleteServerInfo () {
      const deleteServerList = {
        title: '资源信息',
        field: 'deleteServerList',
        slots: {
          default: ({ row }, h) => {
            return [
              <DeleteServers deleteServers={ this.deleteServers } />,
            ]
          },
        },
      }
      this.extraInfo.push(deleteServerList)
    },
    getDeleteServerData (serverIds = []) {
      if (!Array.isArray(serverIds)) {
        serverIds = [serverIds]
      }
      const servers = JSON.parse(this.variables.parameter || '[]')
      if (servers.length > 0) {
        this.deleteServers = servers
        return
      }
      const params = { filter: `id.in(${serverIds.join(',')})` }
      new this.$Manager('servers', 'v2')
        .list({ params })
        .then((res) => {
          this.deleteServers = res.data.data
        })
        .catch(() => {
          this.deleteServers = []
        })
    },
  },
}
</script>
