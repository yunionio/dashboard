<template>
  <base-dialog @cancel="cancelDialog" width="1000px">
    <div slot="header">{{$t('common.text00093')}}</div>
    <div class="clearfix pr-2" slot="body">
      <div class="info-wrapper d-flex flex-wrap pb-3" v-if="params.currentData">
        <div class="info-item" v-for="(item, index) in columns" :key="index">
          <div class="label">{{ item.title }}</div>
          <div class="value">{{ item.formatter ? item.formatter({ row: currentData }) : currentData[item.field] }}</div>
        </div>
      </div>
      <code-mirror v-model="showData" class="codemirror-h-100" :options="cmOptions" ref="codeMirrorRef" />
      <div
        class="float-right"
        v-clipboard:copy="params.data"
        v-clipboard:success="copySuccess"
        v-clipboard:error="copyError">
        <a-icon class="primary-color" type="copy" />
        <a-button type="link" size="small">{{$t('common.text00094')}}</a-button>
      </div>
      <a-button v-if="sessionId" class="float-right mr-3" type="link" size="small" @click="showLog">{{ $t('common.view_scheduler_log') }}</a-button>
    </div>
    <div slot="footer" class="d-flex justify-content-between" v-if="params.currentData">
      <a-button :disabled="prevDisabled" @click="changeCurrentData('prev')"> <a-icon type="left" />{{ $t('common.prev_one') }}</a-button>
      <a-button :disabled="nextDisabled" @click="changeCurrentData('next')">{{ $t('common.next_one') }} <a-icon type="right" /></a-button>
    </div>
    <div slot="footer" v-else>
      <a-button type="primary" @click="cancelDialog">{{ $t('dialog.ok') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import get from 'lodash/get'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import {
  getTimeTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'EventLogDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      cmOptions: {
        tabSize: 2,
        indentUnit: 2,
        smartIndent: true,
        lineNumbers: true,
        readOnly: true,
        theme: '3024-day',
        lineWrapping: true,
        mode: 'application/json',
        gutters: ['CodeMirror-lint-markers'],
        lint: true,
      },
      showData: this.params.data,
      currentData: this.params.currentData || {},
      columns: [
        {
          field: 'id',
          title: '#ID',
        },
        getTimeTableColumn({
          field: 'start_time',
          title: this.$t('common_156'),
        }),
        {
          field: 'obj_type',
          title: this.$t('scope.text_653'),
          formatter: ({ row }) => {
            const { _i18n = {} } = row
            return _i18n.obj_type || (this.$te(`dictionary.${row.obj_type}`) ? this.$t(`dictionary.${row.obj_type}`) : row.obj_type)
          },
        },
        {
          field: 'obj_name',
          title: this.$t('table.title.res_name'),
        },
        {
          field: 'action',
          title: this.$t('common.operation_type'),
          formatter: ({ row }) => {
            const action = get(row, '_i18n.action', row.action)
            return action
          },
        },
        {
          field: 'severity',
          title: this.$t('common_log_table_key.severity'),
        },
        {
          field: 'kind',
          title: this.$t('common_log_table_key.kind'),
        },
        {
          field: 'success',
          title: this.$t('table.title.action_result'),
          formatter: ({ row }) => {
            const txt = row.success ? this.$t('common_159') : this.$t('common_160')
            return txt
          },
        },
        {
          field: 'user',
          title: this.$t('table.title.sponsor'),
        },
        {
          field: 'owner_tenant',
          title: this.$t('table.title.owner_project'),
          formatter: ({ row }) => {
            let txt = row.owner_tenant || '-'
            if (row.owner_domain) {
              txt += `(${row.owner_domain})`
            }
            return txt
          },
        },
      ],
    }
  },
  computed: {
    sessionId () {
      if (this.showData && this.showData.includes('=>sched_fail') && this.showData.includes('session_id=')) {
        const str = this.showData.replaceAll('\\', '')
        return str.match(/session_id="(.*?)"/)[1]
      }
      return ''
    },
    dataList () {
      const list = Object.keys(this.params.listData || {}).map(key => {
        return this.params.listData[key]
      })
      list.sort((a, b) => a.index - b.index)
      return list.map(item => item.data)
    },
    currentIndex () {
      return this.dataList.findIndex(item => item.id === this.currentData.id)
    },
    prevDisabled () {
      return this.currentIndex === 0
    },
    nextDisabled () {
      return this.currentIndex === this.dataList.length - 1
    },
  },
  created () {
    if (this.params.handleSelect) {
      this.params.handleSelect(this.currentData)
    }
  },
  methods: {
    changeCurrentData (type) {
      const index = this.currentIndex + (type === 'prev' ? -1 : 1)
      this.currentData = this.dataList[index]
      this.params.handleSelect(this.currentData)
      this.showData = this.params.getShowData(this.currentData)
    },
    showLog () {
      this.createDialog('SchedulerLogDialog', {
        data: {
          sessionId: this.sessionId,
        },
      })
    },
    copySuccess (evt) {
      this.$message.success(this.$t('common.text00095'))
    },
    copyError () {
      this.$message.error(this.$t('common.text00096'))
    },
  },
}
</script>
<style lang="less" scoped>
.info-item {
  width: 50%;
  padding: 10px 10px;
  flex: 0 0 50%;
  display: flex;
  .label, .value {
    flex: 0 0 40%;
    padding-right: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .label {
    font-weight: bold;
  }
  .value {
    flex: 1 1 auto;
  }
}
</style>
