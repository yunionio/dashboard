<template>
  <div>
    <a-form-item :label="$t('cloudenv.text_395')">
      <a-input v-decorator="decorators.https_proxy" />
      <div slot="extra">{{$t('cloudenv.text_396')}}<br />{{$t('cloudenv.text_397')}}</div>
    </a-form-item>
    <a-form-item :label="$t('cloudenv.text_398')">
      <a-input v-decorator="decorators.http_proxy" />
      <div slot="extra">{{$t('cloudenv.text_399')}}<br />{{$t('cloudenv.text_400')}}</div>
    </a-form-item>
    <a-form-item :label="$t('cloudenv.text_401')">
      <a-input v-decorator="decorators.no_proxy" />
      <div slot="extra">{{$t('cloudenv.text_402')}}<br />
        foo.com,.bar.com,7.7.7.7,8.8.8.8/8,9.9.9.9:80
      </div>
    </a-form-item>
  </div>
</template>

<script>
export default {
  name: 'proxysettingFormItems',
  data () {
    return {
      decorators: {
        https_proxy: [
          'https_proxy',
        ],
        http_proxy: [
          'http_proxy',
        ],
        no_proxy: [
          'no_proxy',
        ],
      },
    }
  },
}
</script>

<style>

</style>
