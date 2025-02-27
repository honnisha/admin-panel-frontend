<template>
  <v-navigation-drawer
    class="navbar-container"
    :modelValue="drawer"
  >
    <v-list-item>
      <router-link to="/dashboard" v-if="getLogo()">
        <v-img
          class="project-logo"
          :alt="getTitle()"
          :src="getLogo()"
          max-width="250"
          :eager="true"
        />
      </router-link>
      <p class="text-h6" v-else>{{ getTitle() }}</p>
    </v-list-item>

    <v-divider></v-divider>

    <v-list v-model:opened="open">
      <v-list-group
        v-for="(group, group_slug) in adminSchema.get_groups()"
        :value="group.title"
        :key="group_slug"
      >
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            :title="group.title"
            :prepend-icon="group.icon"
            density="default"
          ></v-list-item>
        </template>

        <v-list-item
          class="navbar-link"
          v-for="(category, category_slug) in group.categories"
          :key="category_slug"
          :prepend-icon="category.icon"
          :title="category.title"
          :to="categoryUrl(group_slug, category_slug)"
        ></v-list-item>
      </v-list-group>
    </v-list>

  </v-navigation-drawer>
</template>

<script>
import { config_dataset } from '/src/utils/settings'
import { categoryUrl } from '/src/api/scheme'

export default {
  props: {
    adminSchema: {type: Object, required: true},
  },
  components: {
  },
  data() {
    return {
      drawer: null,
      open: null,
      categoryUrl: categoryUrl,
    }
  },
  created() {
  },
  methods: {
    getLogo() {
      return config_dataset.logo_image
    },
    getTitle() {
      return config_dataset.title
    },
    toggleDrawer() {
      this.drawer = !this.drawer
    },
  }
}
</script>
