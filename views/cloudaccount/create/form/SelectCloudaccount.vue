<template>
  <div class="cloudaccount pt-2">
    <div class="env-item-wrap my-5" v-for="(cloudaccounts, env) of types" :key="env">
      <h2 class="mb-3">{{ envTitle[env] }}</h2>
      <div class="items d-flex flex-wrap">
        <div class="item d-flex p-2 mr-3 align-items-center" :class="{ active: currentItem.name === item.name }" v-for="(item, cloudaccount) of cloudaccounts" :key="cloudaccount" @click="selectProvider(item)">
          <img :src="item.logo" />
          <h5 class="flex-fill" v-if="showName(item)">{{ item.name }}</h5>
        </div>
      </div>
    </div>
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
  methods: {
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
