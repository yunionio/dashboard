<template>
  <div>
    <a-result status="403" title="403" :subTitle="`抱歉，您不属于任何${$t('dictionary.project')}，您可以做以下操作：`">
      <template v-slot:extra>
        <div>
          <a-button type="primary" @click="joinProject" v-if="showJoinBtn">申请加入{{ $t('dictionary.project') }}</a-button>
          <a-button class="ml-2" @click="handleLogout">切换账号</a-button>
          <a-button class="ml-2" @click="handleLogout">退出登录</a-button>
        </div>
        <div class="mt-2" v-if="showJoinBtn">
          <a-button type="link">
            <router-link to="/no-project-status">我已申请，点击查看状态</router-link>
          </a-button>
        </div>
      </template>
    </a-result>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import WorkflowMixin from '@/mixins/workflow'
import WindowMixin from '@/mixins/windows'

export default {
  name: 'NoProject',
  mixins: [WindowMixin, WorkflowMixin],
  computed: {
    ...mapGetters(['userInfo']),
    showJoinBtn () {
      return this.checkWorkflowEnabled(this.WORKFLOW_TYPES.APPLY_JOIN_PROJECT)
    },
  },
  watch: {
    userInfo: {
      handler (val = {}, oldVal = {}) {
        if (val.id !== oldVal.id) {
          if (!R.isNil(val.projects) && !R.isEmpty(val.projects)) {
            this.$router.push('/')
          }
        }
      },
      immediate: true,
    },
  },
  methods: {
    joinProject () {
      this.createDialog('ApplyJoinProjectDialog', {
        success: () => {
          this.$router.push('/no-project-status')
        },
      })
    },
    async handleLogout () {
      this.$store.dispatch('auth/logout')
      this.$router.push('/auth')
    },
  },
}
</script>
