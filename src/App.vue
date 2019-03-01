<template>
  <v-app>
    <v-toolbar app>
      <v-toolbar-title class="headline text-uppercase">
        <span class="font-weight-light">Awesome Agora</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu offset-y>
        <v-btn flat icon slot="activator">
          <v-icon>menu</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile
            v-for="({text, href}) in _routes"
            :key="href"
          >
            <v-list-tile-title @click="$router.push(href)" style="cursor: pointer">{{ text }}</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
    </v-toolbar>

    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      //
    };
  },
  computed: {
    _routes() {
      return this.$router.options.routes.map(item => ({
        href: item.path,
        text: item.name
      }));
    }
  },
  mounted() {
    this.$nextTick(() => {});
  }
};
</script>
