<template>
  <div class="history-wrap d-flex flex-column" :class="{ default: !showDelete }">
    <div class="list flex-fill overflow-auto">
      <template v-for="item of dataSource">
        <div class="item d-flex align-items-center pb-2 pt-2" :key="item[0]" @click="handleSelect(item[0])">
          <div class="left flex-fill">
            <div class="l1info">{{ item[0] }} - {{ item[1].displayname }}</div>
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
          <a-button type="link" icon="user" class="pl-0 week-link-button" @click="showDelete = true" size="small">{{ $t('auth.remove.history.user.btn') }}</a-button>
        </div>
        <div class="flex-shrink-1 flex-grow-1 text-right">
          <a-button type="link" icon="user-delete" class="pr-0 week-link-button" size="small" @click="$router.replace('/auth/login')">{{ $t('auth.outher.history.user.btn') }}</a-button>
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
  data () {
    return {
      showDelete: false,
      deleteKeys: [],
    }
  },
  computed: {
    ...mapState('auth', {
      historyUsers: state => state.historyUsers,
    }),
    dataSource () {
      return R.sort((a, b) => {
        return a[1]['update_time'] - b[1]['update_time']
      }, Object.entries(this.historyUsers))
    },
  },
  watch: {
    historyUsers (val) {
      if (Object.keys(val).length === 0) {
        this.$router.replace('/auth/login')
      }
    },
  },
  methods: {
    handleDelete (key) {
      this.$store.commit('auth/UPDATE_HISTORY_USERS', {
        key,
        action: 'delete',
      })
    },
    handleSelect (username) {
      if (this.showDelete) return
      this.$router.replace({
        path: '/auth/login',
        query: {
          username,
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
      &:hover {
        background-color: #e8f0fe;
      }
    }
  }
}
</style>
