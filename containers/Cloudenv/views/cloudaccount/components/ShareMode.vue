<template>
  <div v-if="shareModeShow">
    <!-- 共享范围选择 -->
    <a-form-item :label="$t('cloudenv.text_282')" :extra="extra">
      <a-radio-group v-decorator="decorators.share_mode">
        <template v-for="item of shareModeOptions">
          <a-radio-button :key="item.key" :value="item.key">{{ item.label }}</a-radio-button>
        </template>
      </a-radio-group>
    </a-form-item>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ShareMode',
  props: {
    fd: {
      type: Object,
    },
  },
  data () {
    return {
      decorators: {
        share_mode: [
          'share_mode',
          {
            initialValue: 'account_domain',
            rules: [{ required: true }],
          },
        ],
      },
      shareModeOptions: [
        { key: 'account_domain', label: this.$t('cloudenv.text_285') },
        { key: 'global', label: this.$t('cloudenv.global_share') },
      ],
    }
  },
  computed: {
    ...mapGetters(['l3PermissionEnable', 'isAdminMode']),
    shareModeShow () {
      return this.l3PermissionEnable && this.isAdminMode
    },
    extra () {
      const shareModeExtra = {
        account_domain: this.$t('cloudenv.text_288', [this.$t('dictionary.cloudaccount'), this.$t('dictionary.domain'), this.$t('dictionary.project'), this.$t('dictionary.cloudaccount')]),
        global: this.$t('cloudenv.global_share_tip'),
      }
      return shareModeExtra[this.fd.share_mode]
    },
  },
}
</script>
