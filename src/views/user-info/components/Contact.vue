<template>
  <div>
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
import { hasServices } from '@/utils/auth'
import UpdateUserInfo from './Update'

export default {
  name: 'Contact',
  components: {
    UpdateUserInfo,
  },
  data () {
    return {
      isNotifyEnabled: false,
      color: {
        true: '#52c41a',
        false: 'rgba(0, 0, 0, 0.25)',
      },
      updateDialog: {
        loading: false,
        visible: false,
      },
      contacts: {
        mobile: '',
        email: '',
        verified_contact_types: [],
        enabled_contact_types: [],
      },
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
  destroyed () {
    this.manager = null
  },
  created () {
    this.isNotifyEnabled = hasServices('notify')
    this.manager = new this.$Manager('receivers', 'v1')
    this.fetchContact(true)
  },
  methods: {
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
      if (!verified) {
        this.createDialog('VerifyUserInfoDialog', {
          contactType: type,
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

<style scoped>

</style>
