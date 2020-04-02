<template>
  <div>
    <a-form-item label="https代理">
      <a-input v-decorator="decorators.https_proxy" />
      <div slot="extra">
        例如：http|https|socks5://proxy.example.com:8080 <br />
        若请求的url是https，优先使用https代理，可以为空，为空则使用http代理
      </div>
    </a-form-item>
    <a-form-item label="http代理">
      <a-input v-decorator="decorators.http_proxy" />
      <div slot="extra">
        例如：http|https|socks5://proxy.example.com:8081 <br />
        建议https代理和http代理至少填写一个，可以为空，为空则代表直连
      </div>
    </a-form-item>
    <a-form-item label="不走代理地址">
      <a-input v-decorator="decorators.no_proxy" />
      <div slot="extra">
        不经过代理连接的地址列表，多个以英文状态的逗号分隔，例如：<br />
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
