<template>
  <v-container>
    <v-layout
      wrap
    >
      <v-flex xs12>
        <v-card>
          <v-toolbar color="indigo" dark>
            <v-toolbar-title>Todo List</v-toolbar-title>
          </v-toolbar>
          <v-list two-line>
            <v-list-tile @click="navigateTo(item.url)" v-for="(item, index) in todoList" :key="index">
              <v-list-tile-content>
                <v-list-tile-title>
                  {{item.title}}
                </v-list-tile-title>
                <v-list-tile-sub-title>{{item.description}}</v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-checkbox
                  v-model="item.finished"
                  readonly
                ></v-checkbox>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data() {
    this.todoList = [
      {
        title: "Basic RTC",
        finished: true,
        url: "/basic_rtc",
        description:
          "Implement basic rtc with advanced options, such as attendee mode, codec, mode, etc."
      },
      {
        title: "Video Processing",
        finished: true,
        url: "/video_processor",
        description: "Process agora video stream with webassembly"
      },
      {
        title: "Screen Sharing",
        finished: false,
        description:
          "Implement screen sharing on Chrome (temporarily by Chrome extension) and Firefox"
      },
      {
        title: "Audio Mixing",
        finished: false,
        description: "Add bgm for you!"
      },
      {
        title: "Custom Stream Player",
        finished: false,
        description: "Custom your own declarative stream player"
      }
    ];
    return {};
  },
  methods: {
    navigateTo(url) {
      if (url) {
        this.$router.push(url);
      }
    }
  }
};
</script>
