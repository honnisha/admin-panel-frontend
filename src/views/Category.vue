<template>

  <template v-if="categorySchema.type === 'table'">
    <TableCategory :admin-schema="adminSchema" :category-schema="categorySchema"/>
  </template>

  <template v-if="categorySchema.type === 'graphs'">
    <GraphsCategory :admin-schema="adminSchema" :category-schema="categorySchema"/>
  </template>

  <template v-else>
    Category type "{{ categorySchema.type }}" is not supported
  </template>

</template>

<script>
import { config_dataset } from '/src/utils/settings'
import TableCategory from '/src/components/table/TableCategory.vue'
import GraphsCategory from '/src/components/graphs/GraphsCategory.vue'

export default {
  props: {
    adminSchema: {type: Object, required: true},
    settings: {type: Object, required: true},

    group: {type: String, required: true},
    category: {type: String, required: true},
  },
  components: {
    TableCategory,
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
        if (categorySchema) {
          document.title = `${categorySchema.title} | ${config_dataset.title}`
        }
      }
    },
  },
  methods: {
  },
}
</script>
