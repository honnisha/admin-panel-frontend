<template>
  <div>
    {{ group }}/{{ category }} {{ categorySchema.type }}
  </div>
</template>

<script>
import { config_dataset } from '/src/utils/settings'

export default {
  props: {
    adminSchema: {type: Object, required: true},
    settings: {type: Object, required: true},

    group: {type: String, required: true},
    category: {type: String, required: true},
  },
  components: {
  },
  data() {
    return {
      currentTab: null,
      apiMethods: null,
      categorySchema: null,
    }
  },
  created() {
    this.categorySchema = this.adminSchema.get_category(this.group, this.category)
    if (!this.categorySchema) {
      console.error(`Page ${this.category} not found`)
      this.$router.push({ path: '/404' })
      return
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(to, from) {
        const categorySchema = this.adminSchema.get_category(this.group, this.category)
        document.title = `${categorySchema.title} | ${config_dataset.title}`
      }
    },
  },
  methods: {
  },
}
</script>
