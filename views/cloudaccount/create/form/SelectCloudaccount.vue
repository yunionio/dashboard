<template>
  <div class="cloudaccount pt-2">
    <a-alert type="info" show-icon class="mt-2">
      <template slot="message">
        新建云账号可选平台与您在「功能选择」时选择平台一致,如需调整可点击右上角 “<icon type="question" style="font-size: 15px;" />” 选择「功能选择」重新进入配置即可(备注:若无相应菜单请联系管理员设置)
      </template>
    </a-alert>
    <template v-for="(cloudaccounts, env) of types">
      <div class="env-item-wrap my-5" v-if="isShowItem(env)" :key="env">
        <h2 class="mb-3">{{ envTitle[env] }}</h2>
        <div class="items d-flex flex-wrap">
          <template v-for="(item, cloudaccount) of cloudaccounts">
            <div class="item d-flex p-2 mr-3 align-items-center" v-if="isShowItem(item)" :class="{ active: currentItem.name === item.name }" :key="cloudaccount" @click="selectProvider(item)">
              <img :src="item.logo" />
              <h5 class="flex-fill" v-if="showName(item)">{{ item.name }}</h5>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { CLOUDACCOUNT_TYPES, ENV_TITLE } from '@Cloudenv/views/cloudaccount/constants'

export default {
  name: 'SelectCloudaccount',
  props: {
    currentItem: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      types: CLOUDACCOUNT_TYPES,
      envTitle: ENV_TITLE,
    }
  },
  computed: {
    globalSettingSetupKeys () {
      const { globalSetting } = this.$store.state
      if (globalSetting && globalSetting.value) {
        return globalSetting.value.setupKeys
      }
      return undefined
    },
  },
  watch: {
    globalSettingSetupKeys: {
      handler (value) {
        if (value && value.length > 0 && this.defaultItem()) {
          this.$emit('update:currentItem', this.defaultItem())
        }
      },
      immediate: true,
    },
  },
  methods: {
    defaultItem () {
      for (const env in this.types) {
        for (const provider in this.types[env]) {
          if (this.globalSettingSetupKeys.indexOf(provider.toLowerCase()) > -1) {
            return this.types[env][provider]
          }
        }
      }
    },
    isShowItem (item) {
      if (this.globalSettingSetupKeys === undefined) {
        return true
      }
      if (typeof item === 'string') {
        if (item === 'private' && this.globalSettingSetupKeys.indexOf('vmware') > -1) return true
        return this.globalSettingSetupKeys.indexOf(item) > -1
      }
      return this.globalSettingSetupKeys.indexOf(item.provider.toLowerCase()) > -1
    },
    selectProvider (item) {
      this.$emit('update:currentItem', item)
    },
    showName (item) {
      if (item.hiddenName === true) {
        return false
      } else {
        return true
      }
    },
  },
}
</script>

<style lang="scss">
.cloudaccount {
  h2 {
    font-size: 14px;
    margin: 0;
  }
}
</style>
