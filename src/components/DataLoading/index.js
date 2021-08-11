export default {
  name: 'DataLoading',
  props: {
    tooltip: {
      type: String,
      required: true,
    },
  },
  render (h) {
    return (
      <span title={ this.tooltip }>
        <a-icon type="loading" />
      </span>
    )
  },
}
