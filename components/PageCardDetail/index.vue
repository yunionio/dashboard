<template>
  <div class="page-card-detail d-flex border p-4 align-items-center">
    <div class="img mr-5">
      <img style="height: 200px;" ref="imgRef" @error="getDefaultImg" :src="img" :alt="pageTitle" />
    </div>
    <div class="text-wrap">
      <div class="title mb-2">{{ pageTitle }}</div>
      <div class="description">{{ description }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageCardDetail',
  props: {
    img: {
      type: String,
    },
    pageTitle: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  data () {
    return {
      defaultImg: require('../../assets/images/invalidImg.svg'),
    }
  },
  methods: {
    getDefaultImg () {
      this.$refs.imgRef.src = this.defaultImg
    },
  },
}
</script>

<style lang="scss" scoped>
.page-card-detail {
  .text-wrap {
    .title {
      color: #000;
      font-size: 20px;
    }
    .description {
      color: #ccc;
    }
  }
}
</style>
