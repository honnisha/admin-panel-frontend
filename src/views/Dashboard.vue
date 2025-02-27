<template>
  <div class="dashboard-page">

    <div
      class="dashboard-element"
      cols="12"
      md="3"
      v-for="(group, group_slug) in adminSchema.get_groups()"
      :key="group_slug"
    >
        <v-card
          class="mx-auto"
          :prepend-icon="group.icon"
          width="400"
        >
          <template v-slot:title>
            <span class="font-weight-black">{{ group.title }}</span>
          </template>

          <v-card-text class="bg-surface-light pt-4">

            <v-list>
              <v-list-item
                v-for="(category, category_slug) in group.categories"
                :key="category_slug"
                :title="category.title"
                :prepend-icon="category.icon"
                :to="categoryUrl(group_slug, category_slug)"
              ></v-list-item>
            </v-list>

          </v-card-text>
        </v-card>

      </div>

  </div>
</template>

<script>
import { config_dataset } from '/src/utils/settings'
import { categoryUrl } from '/src/api/scheme'

export default {
  props: {
    adminSchema: {type: Object, required: true},
  },
  data() {
    return {
      categoryUrl: categoryUrl,
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(to, from) {
        document.title = `${this.$t('mainPage')} | ${config_dataset.title}`
      }
    },
  },
}
</script>
