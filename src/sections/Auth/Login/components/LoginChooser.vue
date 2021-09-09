<template>
  <div id="chooser" class="history-wrap d-flex flex-column" :class="{ default: !showDelete }">
    <div class="list flex-fill overflow-auto">
      <template v-for="item of dataSource">
        <div class="item d-flex align-items-center pb-2 pt-2" :key="item[0]" @click="handleSelect(item)">
          <div class="left flex-fill">
            <div class="l1info">{{idx}}{{ item[1]['name'] }} - {{ item[1]['domain']['name'] }}{{ item[1]['isSSO'] ? ' (SSO)' : '' }}</div>
            <div class="l2info text-color-help mt-1">{{ $t('common.text00118') }}：{{ $te(`authChooser.${item[1]['scope']}`) ? $t(`authChooser.${item[1]['scope']}`) : '-' }}</div>
            <div class="l2info text-color-help mt-1">{{ $t('dictionary.project') }}：{{ item[1].projectName }}</div>
          </div>
          <template v-if="showDelete">
            <div class="right flex-grow-0 flex-shrink-0">
              <a-button type="danger" ghost shape="circle" icon="delete" size="small" @click.stop="handleDelete(item[0])" />
            </div>
          </template>
        </div>
      </template>
    </div>
    <div class="actions flex-grow-0 flex-shrink-0 d-flex">
      <template v-if="!showDelete">
        <div class="flex-shrink-1 flex-grow-1 text-left pr-2">
          <a-button type="link" size="large" @click="$router.replace({ path: '/auth/login', query: { rf: $route.query.rf, domain: $route.query.domain } })">
            <icon type="user" class="icon-user" />
            {{ $t('scope.auth.outher.history.user.btn') }}
          </a-button>
        </div>
        <div class="flex-shrink-1 flex-grow-1 text-right pl-2">
          <a-button type="link" class="user-del-btn" size="large" @click="showDelete = true">
            <icon type="user-del" class="icon-user-del" />
            {{ $t('scope.auth.remove.history.user.btn') }}
          </a-button>
        </div>
      </template>
      <template v-else>
        <div class="text-right flex-fill">
          <a-button type="primary" size="large" shape="round" @click="showDelete = false">{{ $t('common.ok') }}</a-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapState } from 'vuex'
import { setSsoIdpIdInCookie } from '@/utils/auth'

export default {
  name: 'LoginChooser',
  props: {
    getUsernameQuery: Function,
  },
  data () {
    return {
      showDelete: false,
      deleteKeys: [],
    }
  },
  computed: {
    ...mapState('auth', {
      loggedUsers: state => state.loggedUsers,
    }),
    dataSource () {
      const data = Object.entries(this.loggedUsers)
      if (data.length === 0) {
        this.$router.replace({
          path: '/auth/login',
          query: {
            rf: this.$route.query.rf,
          },
        })
        return data
      }
      return R.sort((a, b) => {
        return b[1].update_time - a[1].update_time
      }, data)
    },
  },
  watch: {
    loggedUsers (val) {
      const data = Object.entries(this.loggedUsers)
      if (data.length === 0) {
        this.$router.replace({
          path: '/auth/login',
          query: {
            rf: this.$route.query.rf,
          },
        })
      }
    },
  },
  methods: {
    handleDelete (key) {
      this.$store.commit('auth/UPDATE_LOGGED_USERS', {
        key,
        action: 'delete',
      })
    },
    handleSelect (item) {
      if (this.showDelete) return
      if (item[1] && item[1].isSSO && item[1].idpId) {
        const { origin, search } = window.location
        setSsoIdpIdInCookie(item[1].idpId)
        window.location.href = `${origin}/api/v1/auth/sso/redirect/${item[1].idpId}${search || ''}`
        return
      }
      const username = this.getUsernameQuery ? this.getUsernameQuery(item) : item[1].name
      this.$router.replace({
        path: '/auth/login',
        query: {
          username,
          fd_domain: item[1].domain.name,
          displayname: item[1].displayname,
          ...this.$route.query,
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import "@/styles/less/theme";

.history-wrap {
  height: 346px !important;
  margin: 0 -60px 0;
  .item {
    border-bottom: 1px dashed #c9c9c9;
    padding-left: 60px;
    padding-right: 60px;
    cursor: default;
  }
  .actions {
    padding-left: 60px;
    padding-right: 60px;
    margin-top: 18px;
  }
  .l1info {
    color: #000;
    font-size: 22px;
    font-family: Graphik;
    font-weight: 400;
  }
  .l2info {
    font-size: 13px;
  }
  &.default {
    .item {
      cursor: pointer;
      &:hover {
        background-color: @primary-1;
      }
    }
  }
}
// @media only screen and (min-width: 1366px) {
//   .history-wrap {
//     height: 252px !important;
//   }
// }

#chooser .ant-btn-link{
  padding-left: 0;
  .icon-user, .icon-user-del{
    font-size: 24px;
    color: #606266;
    vertical-align: middle;
  }
  .icon-user{
    color: @primary-color;;
  }
  &.user-del-btn{
    color: #606266;
  }
}
</style>
