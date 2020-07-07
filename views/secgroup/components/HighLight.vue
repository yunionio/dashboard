<template>
  <a-tag class="mb-2" v-html="wrapperKeyword(k, v)" />
</template>

<script>
export default {
  name: 'HighLight',
  props: {
    k: {
      type: String,
    },
    v: {
      type: String,
    },
  },
  methods: {
    wrapperKeyword: (k, v) => {
      function highlight (value) {
        return `<span class='font-weight-bold error-color'>${value}</span>`
      }
      return v.replace(new RegExp(k, 'ig'), v => highlight(v))
    },
  },
}
</script>
