<template>
  <a-popover v-model="visible" trigger="click" placement="bottomRight">
    <template slot="content">
      <div class="d-flex align-items-center">
        <span class="label mr-3">{{ $t('scope.kpi.data_range') }}:</span>
        <a-radio-group v-model="form.scope">
          <a-radio-button v-for="(item, index) in scopeOpts" :key="`${item.value}$$${index}`" :value="item.value">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </div>
      <base-select class="mt-2" v-if="form.scope === 'domain'" v-model="form.domain" remote resource="domains" isDefaultSelect :params="domainParams" @update:resList="updateDomainList" />
      <base-select class="mt-2" v-else-if="form.scope === 'project'" v-model="form.project" remote resource="projects" :params="projectParams" @update:resList="updateProjectList" />
      <div class="d-flex justify-content-end mt-2">
        <a-button type="primary" @click="handleConfirm">{{ $t('dialog.ok') }}</a-button>
      </div>
    </template>
    <div class="data-range-text" :style="textStyle">
      <span class="label mr-2">{{ $t('scope.kpi.data_range') }}:</span>
      <span class="value">{{ dataRangeText }}<icon type="caret-down" class="ml-1" /></span>
    </div>
  </a-popover>
</template>

<script>
import * as R from 'ramda'
import storage from '@/utils/storage'

export default {
  name: 'DataRange',
  props: {
    edit: {
      type: Boolean,
      default: false,
    },
    dataRangeParams: {
      type: Object,
    },
  },
  data () {
    return {
      visible: false,
      form: {
        scope: this.dataRangeParams?.scope || this.$store.getters.scope,
        domain: this.dataRangeParams?.domain || '',
        project: this.dataRangeParams?.project || '',
      },
      domainParams: {
        scope: this.$store.getters.scope,
        limit: 20,
      },
      projectParams: {
        scope: this.$store.getters.scope,
        limit: 20,
      },
      domainList: [],
      projectList: [],
    }
  },
  computed: {
    scopeOpts () {
      if (this.$store.getters.scope === 'system') {
        return [
          { value: 'system', label: this.$t('dashboard.current_system') },
          { value: 'domain', label: this.$t('dashboard.specified_domain') },
          { value: 'project', label: this.$t('dashboard.specified_project') },
        ]
      } else if (this.$store.getters.scope === 'domain') {
        return [
          { value: 'domain', label: this.$t('dashboard.current_domain') },
          { value: 'project', label: this.$t('dashboard.specified_project') },
        ]
      }
      return [
        { value: 'project', label: this.$t('dashboard.specified_project') },
      ]
    },
    dataRangeText () {
      let text = ''
      if (this.dataRangeParams?.scope === 'system') {
        text = this.$t('dashboard.current_system')
      } else if (this.dataRangeParams?.scope === 'domain') {
        if (this.$store.getters.isDomainMode) {
          text = this.$t('dashboard.current_domain')
        }
        if (this.$store.getters.isAdminMode) {
          text = this.currentDomain?.name ? `${this.currentDomain.name} (${this.$t('dictionary.domain')})` : ''
        }
      }
      if (this.dataRangeParams?.scope === 'project') {
        text = this.currentProject?.name ? `${this.currentProject.name} (${this.$t('dictionary.project')})` : ''
      }
      if (!text) {
        text = this.$store.getters.isAdminMode ? this.$t('dashboard.current_system') : this.$t('dashboard.current_domain')
      }
      return text
    },
    currentDomain () {
      return this.domainList.find(domain => domain.id === this.dataRangeParams?.domain)
    },
    currentProject () {
      return this.projectList.find(project => project.id === this.dataRangeParams?.project)
    },
    textStyle () {
      if (this.edit) {
        return {
          border: '1px solid #d9d9d9',
          'border-left': 'none',
          'background-color': '#fff',
          padding: '0 15px',
        }
      }
      return {}
    },
  },
  watch: {
    'dataRangeParams.scope': {
      handler (val) {
        this.checkSelectedRange()
      },
      immediate: true,
    },
    'dataRangeParams.domain': {
      handler (val) {
        this.checkSelectedRange()
      },
      immediate: true,
    },
    'dataRangeParams.project': {
      handler (val) {
        this.checkSelectedRange()
      },
      immediate: true,
    },
  },
  methods: {
    handleConfirm () {
      console.log('handleConfirm', this.form)
      if (this.form.scope === 'domain' && !this.form.domain) {
        this.$message.error(this.$t('common.tips.select', [this.$t('dictionary.domain')]))
        return
      }
      if (this.form.scope === 'project' && !this.form.project) {
        this.$message.error(this.$t('common.tips.select', [this.$t('dictionary.project')]))
        return
      }
      this.updateDataRange(R.clone(this.form))
      this.visible = false
    },
    updateDomainList (resList) {
      resList.forEach(item => {
        if (!this.domainList.some(domain => domain.id === item.id)) {
          this.domainList.push(item)
        }
      })
    },
    updateProjectList (resList) {
      resList.forEach(item => {
        if (!this.projectList.some(project => project.id === item.id)) {
          this.projectList.push(item)
        }
      })
    },
    async checkSelectedRange () {
      if (this.dataRangeParams?.scope === 'domain' && this.dataRangeParams?.domain && !this.currentDomain) {
        try {
          console.log('domain', this.dataRangeParams?.domain)
          const res = await new this.$Manager('domains', 'v1').list({ params: { scope: this.$store.getters.scope, limit: 1, filter: `id.in(${this.dataRangeParams?.domain})` } })
          const data = res.data?.data || []
          if (data.length > 0) {
            this.domainList.push(data[0])
          } else {
            this.updateDataRange({ scope: this.$store.getters.scope, domain: '', project: '' })
          }
        } catch (error) {
          // 获取失败,更新为当前视图
          throw error
        }
      } else if (this.dataRangeParams?.scope === 'project' && this.dataRangeParams?.project && !this.currentProject) {
        try {
          const res = await new this.$Manager('projects', 'v1').list({ params: { scope: this.$store.getters.scope, limit: 1, filter: `id.in(${this.dataRangeParams?.project})` } })
          const data = res.data?.data || []
          if (data.length > 0) {
            this.projectList.push(data[0])
          } else {
            this.updateDataRange({ scope: this.$store.getters.scope, domain: '', project: '' })
          }
        } catch (error) {
          throw error
        }
      }
    },
    updateDataRange (params) {
      this.$emit('updateDataRange', params)
      storage.set('__oc_dashboard_data_range__', params)
    },
  },
}
</script>

<style lang="less" scoped>
.data-range-text {
  display: inline-flex;
  align-items: center;
  line-height: 30px;
  padding: 0 10px;
  height: 32px;
  cursor: pointer;
  width: max-content;
  flex: 0 0 auto;
  white-space: nowrap;
  transition: color 0.2s ease;
  &:hover {
    color: var(--antd-wave-shadow-color);
  }
}
</style>
