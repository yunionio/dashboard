export function openWebConsole (data) {
  let href = ''
  if (process.env.VUE_APP_WEBCONSOLE_DEBUG === 'true') {
    href = `${this.$appConfig.webConsolePath}${data.access_url.replace(/^.*?web-console\//, '')}`
  } else {
    href = data.access_url
  }
  window.open(`${href}&session_id=${data.session}${data.extra_param_str || ''}`)
}
