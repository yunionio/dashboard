<template>
  <div class="history-wrap d-flex flex-column" :class="{ default: !showDelete }">
    <div class="list flex-fill overflow-auto">
      <template v-for="item of dataSource">
        <div class="item d-flex align-items-center pb-2 pt-2" :key="item[0]" @click="handleSelect(item)">
          <div class="left flex-fill">
            <div class="l1info">{{ item[1]['name'] }} - {{ item[1]['domain']['name'] }}</div>
            <div class="l2info text-color-help mt-1">{{ $t('common.text00118') }}：{{ $t(`authChooser.${item[1]['scope']}`) }}</div>
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
        <div class="flex-shrink-1 flex-grow-1 text-left">
          <a-button type="link" icon="user" class="pr-0 week-link-button" size="small" @click="$router.replace('/auth/login')">{{ $t('auth.outher.history.user.btn') }}</a-button>
        </div>
        <div class="flex-shrink-1 flex-grow-1 text-right">
          <a-button type="link" icon="user-delete" class="pl-0 week-link-button" @click="showDelete = true" size="small">{{ $t('auth.remove.history.user.btn') }}</a-button>
        </div>
      </template>
      <template v-else>
        <div class="text-right flex-fill">
          <a-button type="link" @click="showDelete = false" size="small">{{ $t('common.ok') }}</a-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapState } from 'vuex'

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
      return R.sort((a, b) => {
        return b[1]['update_time'] - a[1]['update_time']
      }, Object.entries(this.loggedUsers))
    },
  },
  watch: {
    loggedUsers (val) {
      if (Object.keys(val).length === 0) {
        this.$router.replace('/auth/login')
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
      const username = this.getUsernameQuery ? this.getUsernameQuery(item) : item[1].name
      this.$router.replace({
        path: '/auth/login',
        query: {
          username,
          domain: item[1]['domain']['name'],
          displayname: item[1]['displayname'],
          ...this.$route.query,
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.history-wrap {
  height: 290px !important;
  margin: 0 -60px 0;
  .item {
    border-bottom: 1px solid #ccc;
    padding-left: 60px;
    padding-right: 60px;
    cursor: default;
  }
  .actions {
    padding-left: 60px;
    padding-right: 60px;
  }
  .l1info {
    font-size: 15px;
  }
  .l2info {
    font-size: 13px;
  }
  &.default {
    .item {
      cursor: pointer;
      &:hover {
        background-color: #e8f0fe;
      }
    }
  }
}
</style>
