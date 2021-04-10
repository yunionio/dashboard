<template>
  <div>
    <h4 class="text-center mb-4">{{ userInfo.name || userInfo.email }}</h4>
    <a-card
      size="small"
      class="mb-4"
      :loading="loading"
      v-if="isNotifyEnabled">
      <div slot="title"><span>{{$t('scope.text_233')}}</span><a-button type="link" icon="edit" @click="() => updateDialog.visible = true">{{$t('scope.text_234')}}</a-button></div>
      <div>
        <div class="d-flex mb-2">
          <div class="user-info-item-label flex-grow-0 flex-shrink-0 text-right">{{$t('scope.text_235')}}</div>
          <div class="flex-fill ml-3">
            <span>{{ imobile }}</span>
            <!-- <span class="ml-2" v-if="contacts.mobile"><contact-status @refresh="fetchContact" :status="contacts.mobile_status" type="mobile" :contact="contacts.mobile" /></span> -->
          </div>
        </div>
        <div class="d-flex mb-2">
          <div class="user-info-item-label flex-grow-0 flex-shrink-0 text-right">{{$t('scope.text_236')}}</div>
          <div class="flex-fill ml-3">
            <span>{{ contacts.email || '-' }}</span>
            <!-- <span class="ml-2" v-if="contacts.email"><contact-status @refresh="fetchContact" :status="contacts.email_status" type="email" :contact="contacts.email" /></span> -->
          </div>
        </div>
        <div class="d-flex mb-2">
          <div class="user-info-item-label flex-grow-0 flex-shrink-0 text-right">{{$t('scope.text_237')}}</div>
          <div class="flex-fill ml-3">{{ contacts.enabled ? $t('scope.text_19') : $t('scope.text_20') }}</div>
        </div>
        <div class="d-flex mb-2">
          <div class="user-info-item-label flex-grow-0 flex-shrink-0 text-right">{{$t('common_613')}}</div>
          <div class="flex-fill ml-3">
            <template
              v-for="(obj, index) in contactTypes">
              <icon
                :class="{ 'ml-2': index !== 0 }"
                @click="contactHandle(obj.verified, obj.contact_type)"
                :key="obj.contact_type"
                :type="obj.contact_type"
                :style="{ color: color[obj.verified] }" :title="getTitle(obj, obj.contact_type)" />
            </template>
          </div>
        </div>
      </div>
    </a-card>
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
    <a-modal
      :title="$t('scope.text_243')"
      width="700px"
      :visible="updateDialog.visible"
      @cancel="() => updateDialog.visible = false"
      destroyOnClose>
      <template v-slot:footer>
        <a-button key="submit" type="primary" :loading="updateDialog.loading" @click="doUpdateUserInfo">{{$t('scope.text_14')}}</a-button>
        <a-button key="back" @click="() => updateDialog.visible = false">{{$t('scope.text_152')}}</a-button>
      </template>
      <update-user-info ref="updateUserInfo" :contacts="contacts" />
    </a-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import ContactStatus from './components/ContactStatus'
import IdpCard from './components/IdpCard'
import UpdateUserInfo from './components/Update'
import { hasServices } from '@/utils/auth'
import { SHOW_SYSTEM_RESOURCE, contactMap } from '@/constants'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'User',
  components: {
    IdpCard,
    // ContactStatus,
    UpdateUserInfo,
  },
  mixins: [WindowsMixin],
  data () {
    return {
      loading: false,
      isNotifyEnabled: false,
      contacts: {
        mobile: '',
        email: '',
        verified_contact_types: [],
        enabled_contact_types: [],
      },
      updateDialog: {
        loading: false,
        visible: false,
      },
      isShowSystemResource: false,
      color: {
        true: '#52c41a',
        false: 'rgba(0, 0, 0, 0.25)',
      },
      contactMap,
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'profile', 'isAdminMode']),
    imobile () {
      if (this.contacts && this.contacts.international_mobile) {
        const c = this.contacts.international_mobile
        return c.area_code ? `+${c.area_code} ${c.mobile}` : c.mobile
      }

      return '-'
    },
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
    contactTypes () {
      if (this.contacts && this.contacts.enabled_contact_types) {
        const contactTypes = []
        this.contacts.enabled_contact_types.forEach((type) => {
          const item = this.contacts.verified_infos.find(obj => obj.contact_type === type)
          contactTypes.push(item)
        })
        return contactTypes
      }
      return []
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
  destroyed () {
    this.manager = null
  },
  created () {
    this.isNotifyEnabled = hasServices('notify')
    this.manager = new this.$Manager('receivers', 'v1')
    this.fetchContact(true)
  },
  methods: {
    getRoles (rlist) {
      const roles = []
      for (let i = 0; i < rlist.length; i++) {
        roles[i] = rlist[i].name
      }
      return roles
    },
    fetchContact (isChangeLoading) {
      if (isChangeLoading) this.loading = true
      this.manager.get({ id: this.userInfo.id }).then(res => {
        const contacts = res.data
        this.contacts = {
          ...contacts,
        }
        if (isChangeLoading) this.loading = false
      }).catch((err) => {
        if (isChangeLoading) this.loading = false
        throw err
      })
    },
    async doUpdateUserInfo () {
      this.updateDialog.loading = true
      try {
        const values = await this.$refs.updateUserInfo.getValues()
        if (this.contacts.id) {
          await this.manager.update({
            id: this.userInfo.id,
            data: { ...values },
          })
        } else {
          await this.manager.create({
            data: { ...values, uid: this.userInfo.id },
          })
        }
        this.$message.success(this.$t('scope.text_110'))
        this.fetchContact(false)
        this.updateDialog.visible = false
      } catch (error) {
        this.updateDialog.loading = false
        throw error
      } finally {
        this.updateDialog.loading = false
      }
    },
    async doUpdateShowSystemRsChangeHandle (v) {
      try {
        this.$store.dispatch('profile/update', { [SHOW_SYSTEM_RESOURCE]: v })
      } catch (error) {
        throw error
      }
    },
    getTitle (obj, type) {
      const i18Map = {
        email: 'system.text_148',
        mobile: 'system.text_149',
        dingtalk: 'system.text_150',
        feishu: 'system.text_151',
        workwx: 'system.wecom',
      }
      if (!obj.verified) {
        return this.getNote(obj.note)
      }
      return this.$t(i18Map[type], [this.$t(`status.verified.${obj.verified}`)])
    },
    contactHandle (verified, type) {
      const dialogMap = {
        email: 'VerifyEmailDialog',
        mobile: 'VerifyMobileDialog',
        dingtalk: 'VerifyDingtalkDialog',
        feishu: 'VerifyFeishuDialog',
        workwx: 'VerifyWorkwxDialog',
      }
      if (!verified) {
        this.createDialog(dialogMap[type], {
          data: this.contacts,
          success: () => {
            this.fetchContact(false)
            this.$message.success(this.$t('scope.text_110'))
          },
        })
      }
    },
    getNote (note) {
      let _note = ''
      switch (note) {
        case 'no such mobile':
          _note = this.$t('system.no_such_mobile')
          break
        case 'service exceptions':
          _note = this.$t('system.service_exceptions')
          break
        case 'incomplete config':
          _note = this.$t('system.incomplete_config')
          break
        case 'mobile changed, re-verify':
          _note = this.$t('system.mobile_changed_re_verify')
          break
        default:
          _note = this.$t('scope.text_957')
          break
      }
      return _note
    },
  },
}
</script>

<style lang="less" scoped>
.user-info-item-label {
  width: 170px;
}
</style>
