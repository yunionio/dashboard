<template>
  <div>
    <a-result status="403" title="403" :subTitle="$t('common_346', [$t('dictionary.project')])">
      <template v-slot:extra>
        <div>
          <a-button type="primary" @click="joinProject" v-if="showJoinBtn">{{$t('common_205')}}{{$t('dictionary.project')}}</a-button>
          <a-button class="ml-2" @click="handleLogout">{{$t('common_347')}}</a-button>
          <a-button class="ml-2" @click="handleLogout">{{$t('common_348')}}</a-button>
        </div>
        <div class="mt-2" v-if="showJoinBtn">
          <a-button type="link">
            <router-link to="/no-project-status">{{$t('common_349')}}</router-link>
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
