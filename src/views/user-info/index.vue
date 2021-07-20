<template>
  <div>
    <h4 class="text-center mb-4">{{ userInfo.name || userInfo.email }}</h4>
    <contact />
    <a-card
      size="small"
      :title="$t('scope.text_230', [this.$t('dictionary.user')])"
      class="mb-4"
      :loading="loading">
      <vxe-table
        :data="userTableData"
        :show-header="false"
        border="none">
        <vxe-table-column field="label" title="label" width="190" align="right">
          <template v-slot="{ row }">{{ row.label }}:</template>
        </vxe-table-column>
        <vxe-table-column field="value" title="value">
          <template v-slot="{ row }">
            <template v-if="!row.isProjects">
              <list-body-cell-wrap copy field="value" :row="row" />
            </template>
            <template v-else>
              <vxe-table :data="row.value" show-overflow="title" border>
                <vxe-table-column field="current" width="35">
                  <template v-slot="{ row }">
                    <template v-if="row.current">
                      <a-tooltip :title="$t('scope.text_231', [$t('dictionary.project')])">
                        <a-icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" />
                      </a-tooltip>
                    </template>
                  </template>
                </vxe-table-column>
                <vxe-table-column field="id" title="ID" min-width="160">
                  <template v-slot="{ row }">
                    <list-body-cell-wrap copy field="id" :row="row" />
                  </template>
                </vxe-table-column>
                <vxe-table-column field="name" :title="$t('scope.text_21')" />
                <vxe-table-column field="domain" :title="$t('table.title.domain')" />
                <vxe-table-column field="roles" :title="$t('table.title.role')">
                  <template v-slot="{ row }">{{ getRoles(row.roles).join(', ') || '-' }}</template>
                </vxe-table-column>
                <vxe-table-column field="project_policies" :title="$t('table.title.projectPolicy')">
                  <template v-slot="{ row }">{{ row.project_policies && row.project_policies.join(', ') || '-' }}</template>
                </vxe-table-column>
                <vxe-table-column field="domain_policies" :title="$t('table.title.domainPolicy')">
                  <template v-slot="{ row }">{{ row.domain_policies && row.domain_policies.join(', ') || '-' }}</template>
                </vxe-table-column>
                <vxe-table-column field="system_policies" :title="$t('table.title.managePolicy')">
                  <template v-slot="{ row }">{{ row.system_policies && row.system_policies.join(', ') || '-' }}</template>
                </vxe-table-column>
              </vxe-table>
            </template>
          </template>
        </vxe-table-column>
      </vxe-table>
    </a-card>
    <idp-card />
    <a-card
      v-show="isAdminMode"
      size="small"
      :title="$t('scope.text_238')"
      class="mb-4">
      <div class="d-flex">
        <div class="user-info-item-label flex-grow-0 flex-shrink-0 text-right">{{$t('scope.text_239')}}</div>
        <div class="flex-fill ml-3">
          <a-switch :checked-children="$t('table.title.on')" :un-checked-children="$t('table.title.off')" @change="doUpdateShowSystemRsChangeHandle" v-model="isShowSystemResource" />
          <a-tooltip :title="$t('scope.text_242')" placement="right">
            <a-icon type="question-circle-o" class="ml-2" style="position: relative; top: 2px;" />
          </a-tooltip>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import ContactStatus from './components/ContactStatus'
import { SHOW_SYSTEM_RESOURCE, contactMap } from '@/constants'
import WindowsMixin from '@/mixins/windows'
import Contact from './components/Contact'
import IdpCard from './components/IdpCard'

export default {
  name: 'User',
  components: {
    Contact,
    IdpCard,
    // ContactStatus,
  },
  mixins: [WindowsMixin],
  data () {
    return {
      loading: false,
      isShowSystemResource: false,
      contactMap,
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'profile', 'isAdminMode']),
    projects () {
      const ret = this.userInfo.projects.map(item => {
        const current = item.id === this.userInfo.projectId
        return {
          ...item,
          current,
        }
      }).sort((a, b) => {
        return a.name.localeCompare(b.name)
      })
      return ret
    },
    userTableData () {
      const us = this.userInfo
      const passwordExpiresAtStr = us.password_expires_at ? this.$moment(this.userInfo.password_expires_at).format() : '-'
      const ret = [
        { label: this.$t('scope.text_244'), value: us.name },
        { label: this.$t('scope.text_245'), value: us.displayname },
        { label: this.$t('table.title.userId'), value: us.id },
        { label: this.$t('scope.text_246'), value: us.last_login_ip },
        { label: this.$t('scope.text_247'), value: this.$moment(us.last_active_at).format('') },
        { label: this.$t('scope.text_248'), value: passwordExpiresAtStr },
        { label: this.$t('scope.text_249'), value: us.last_login_source },
        { label: this.$t('scope.text_250'), value: us.enable_mfa ? this.$t('table.title.on') : this.$t('table.title.off') },
        { label: this.$t('dictionary.project'), value: this.projects, isProjects: true },
      ]
      return ret
    },
  },
  watch: {
    profile: {
      handler: function (val) {
        if (val) {
          this.isShowSystemResource = val.value && val.value[SHOW_SYSTEM_RESOURCE]
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    getRoles (rlist) {
      const roles = []
      for (let i = 0; i < rlist.length; i++) {
        roles[i] = rlist[i].name
      }
      return roles
    },
    async doUpdateShowSystemRsChangeHandle (v) {
      try {
        this.$store.dispatch('profile/update', { [SHOW_SYSTEM_RESOURCE]: v })
      } catch (error) {
        throw error
      }
    },
  },
}
</script>

<style lang="less" scoped>
.user-info-item-label {
  width: 170px;
}
</style>
