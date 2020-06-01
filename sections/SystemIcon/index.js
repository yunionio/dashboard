export default {
  name: 'SystemIcon',
  props: {
    tooltip: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  render (h) {
    return (
      <span title={ this.tooltip }>
        <image-icon image={ this.name } />
      </span>
    )
  },
}
