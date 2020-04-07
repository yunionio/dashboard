<template>
  <div class="guide pt-2">
    <page-header title="系统引导" />
    <div class="env-items-wrap" v-for="env in ENVS" :key="env">
      <h2 class="mb-3">{{ ENV_TITLE[env] }}</h2>
      <div class="env-items d-flex flex-wrap" v-if="SUB_EBV_ITMS[env]">
        <div class="item d-flex p-2 mr-3 align-items-center" v-for="(item, k) of SUB_EBV_ITMS[env]" :key="k" :class="{ active: key === k }" @click="handleItemClick(env, k)">
          <img :src="item.logo" :style="item.logoStyle" />
          <h5 class="flex-fill">{{ item.name }}</h5>
        </div>
      </div>
    </div>
    <page-footer style="left:0">
      <div class="env-items" slot="left" v-if="currentItem" style="padding-left: 60px">
        <div class="d-flex align-items-center">
          <div class="mr-2">已选择: </div>
          <div class="item d-flex p-1 mb-0 align-items-center active">
            <img :src="currentItem.logo" />
            <h5 class="ml-2" v-if="currentItem.name">{{ currentItem.name }}</h5>
          </div>
        </div>
      </div>
      <div slot="right">
        <a-button class="mr-3" type="primary" @click="handleNext">下一步</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import { ENVS, ENV_TITLE, SUB_EBV_ITMS } from './constants'

export default {
  name: 'GuideIndex',
  data () {
    const TYPES = { ENVS, ENV_TITLE, SUB_EBV_ITMS }
    return {
      ...TYPES,
      key: 'aliyun',
      env: 'public',
    }
  },
  computed: {
    currentItem () {
      const { env, key } = this
      if (env && key) {
        return SUB_EBV_ITMS[env][key]
      }
      return null
    },
  },
  methods: {
    handleItemClick (env, key) {
      this.env = env
      this.key = key
    },
    handleNext () {
      this.$router.push({
        name: 'GuideCreate',
        query: {
          env: this.env,
          key: this.key,
        },
      })
    },
  },
}
</script>

<style lang="scss">
.guide {
  h2 {
    font-size: 14px;
    margin: 0;
  }
}
.env-items-wrap{
  padding: 20px;
}
.env-items {
  .item {
    width: 120px;
    cursor: pointer;
    display: block;
    font-size: 14px;
    margin-bottom: 10px;
    border: 1px solid #eee;
    text-align: center;
    border-radius: 3px;
    box-sizing: border-box;
    &.active {
      border-color:#4DA1FF;
      h5{
        color:#4DA1FF;
      }
    }
    &:hover {
      border-color:#4DA1FF;
      h5{
        color:#4DA1FF;
      }
    }
    h5 {
      margin: 0;
      font-size: 13px;
      font-weight: 400;
    }
    img {
      height: 24px;
    }
  }
}
</style>
