<template>
  <div>
    <detail
      v-if="loaded"
      :onManager="onManager"
      :data="detailsData"
      :hiddenKeys="['created_at', 'updated_at', 'description']"
      :show-desc="false"
      :base-info="baseInfo"
      :extra-info="extraInfo" />
    <loading-block
      v-else
      :layout="loadingLayout" />
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
  name: 'MePartakeDetail',
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
          field: 'initiator_name',
          title: this.$t('common_371'),
          formatter: ({ cellValue, row }) => {
            return row.variables.initiator_name || row.process_instance.start_user_name
          },
        },
        {
          field: 'process_definition_key',
          title: this.$t('common_375'),
          formatter: ({ cellValue, row }) => {
            const pdk = row.variables.process_definition_key || row.process_definition_key
            const objType = getWorkflowType(pdk)
            return objType && objType.name
          },
        },
        getTimeTableColumn({ field: 'start_time', title: this.$t('common_374') }),
        getTimeTableColumn({ field: 'end_time', title: this.$t('common_387') }),
      ],
      extraInfo: [],
      loadingLayout: [
        [10],
        [8, 9],
        [2, 4, 7, 5],
        [13, 9],
        [4, 3, 8],
        [8, 6, 8],
        [13, 9],
      ],
    }
  },
  computed: {
    ...mapGetters(['isDomainMode', 'isAdminMode']),
    variables () {
      return this.data.variables
    },
    proccessDefinitionKey () {
      return this.data.process_definition_key || this.data.process_instance.process_definition_key
    },
    paramter () {
      if (this.variables.paramter) {
        return JSON.parse(this.variables.paramter || '{}')
      }
      return {}
    },
  },
  watch: {
    paramter: {
      handler: function (val) {
        if (WORKFLOW_TYPES.APPLY_DOMAIN_QUOTA === this.proccessDefinitionKey) {
          this.getDomainQuotaData(val.domain)
        }
        if (WORKFLOW_TYPES.APPLY_PROJECT_QUOTA === this.proccessDefinitionKey) {
          this.getProjectQuotaData(val.tenant)
        }
      },
      immediate: true,
    },
  },
  async created () {
    const that = this
    switch (this.proccessDefinitionKey) {
      case WORKFLOW_TYPES.APPLY_MACHINE:
        await this.getApplyMachineData()
        await this.initServerInfo()
        await this.initPriceInfo()
        break
      case WORKFLOW_TYPES.APPLY_SERVER_CHANGECONFIG:
        this.initServerConfigInfo()
        break
      case WORKFLOW_TYPES.APPLY_PROJECT_QUOTA:
        this.initProjectQuotaInfo(that.paramter)
        break
      case WORKFLOW_TYPES.APPLY_DOMAIN_QUOTA:
        this.initDomainQuotaInfo(that.paramter)
        // this.getDomainQuotaData(that.paramter.domain)
        break
      case WORKFLOW_TYPES.APPLY_JOIN_PROJECT:
        this.initProjectInfo()
        break
      case WORKFLOW_TYPES.APPLY_SERVER_DELETE:
        await this.getDeleteServerData(that.variables.ids)
        await this.initDeleteServerInfo()
        break
    }
    if (this.isDomainMode || this.isAdminMode) {
      if (WORKFLOW_TYPES.APPLY_PROJECT_QUOTA === this.proccessDefinitionKey) {
        this.getProjectDomainQuotaData(this.paramter.domain)
      }
    }
    this.initProcessInstanceInfo()
  },
  methods: {
    initServerConfigInfo () {
      const serverConfigs = JSON.parse(this.variables.serverConf || '[]')
      const serverConfList = {
        title: this.$t('common_376'),
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
          activity_name: this.$t('common_377'),
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
          title: this.$t('common_378'),
          assignees: [this.$t('common_379')],
        })
      }
      this.processList = processList
    },
    initProcessHistorys () {
      const processHistory = {
        title: this.$t('common_380'),
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
        title: this.$t('common_377'),
        assignees: this.processInstanceInfo.variables && this.processInstanceInfo.variables.initiator_name,
      })
      const processList = {
        title: this.$t('common_381'),
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
          title: this.$t('common_382', [this.$t('dictionary.project')]),
          items: [
            {
              field: 'description',
              title: this.$t('common_157'),
              formatter: ({ cellValue, row }) => {
                return variables.description || '-'
              },
            },
            {
              field: 'project',
              title: this.$t('common_384'),
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
        title: this.$t('common_385'),
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
