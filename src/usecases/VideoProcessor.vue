<template>
  <v-container>
    <v-toolbar>
      <v-select
        class="auto-width"
        v-model="currentFilter"
        prepend-icon="filter_list"
        :items="filters">
      </v-select>
    </v-toolbar>
    
    <v-content>
      <v-layout wrap>
        <!-- origin stream -->
        <v-flex xs12 md6>
          <div id="origin-stream"></div>
        </v-flex>

        <!-- processed stream -->
        <v-flex xs12 md6>
          <canvas id="processed-stream" width="640" height="480">

          </canvas>
        </v-flex>
      </v-layout>
    </v-content>
  </v-container>
</template>

<script>
const filters = [
  "grayScale",
  "brighten",
  "invert",
  "noise",
  // "sobelFilter",
  // "convFilter",
  // "multiFilter",
  "sunset",
  "analogTV",
  "emboss",
  "blur",
  "sharpen",
  "strongSharpen",
  "clarity",
  "goodMorning",
  "acid",
  "urple",
  "forest",
  "romance",
  "hippo",
  "longhorn",
  "underground",
  "rooster",
  "mist",
  "tingle",
  // "bacteria",
  "dewdrops",
  "destruction",
  "hulk",
  "ghost",
  "twisted",
  "security"
];
import AgoraRTC from '../utils/AgoraUtils'

export default {
  data() {
    this.filters = filters;
    return {
      originStream: undefined,
      processedStream: undefined,
      webdsp: undefined,
      currentFilter: "grayScale"
    };
  },
  methods: {
    async createStream() {
      let originStream = AgoraRTC.createStream({
          video: true,
          audio: false,
          screen: false,
          streamID: 4214
        })
      originStream.setVideoProfile("480p_4");
      await originStream.init();
      return originStream;
    },

    process() {
      let method = this.webdsp[this.currentFilter];
      let width = this._video.offsetWidth || this._video.width;
      let height = this._video.offsetHeight || this._video.height;
      this._context.drawImage(this._video, 0, 0, width, height);
      let frame = this._context.getImageData(0, 0, width, height);
      try {
        frame.data.set(method(frame.data));
      } finally {
        this._context.putImageData(frame, 0, 0);
        return requestAnimationFrame(this.process);
      }
    }
  },
  mounted() {
    this.$nextTick(async () => {
      // create and play stream
      this.originStream = await this.createStream();
      this.originStream.play("origin-stream");
      // load wasm
      this.webdsp = await window.loadWASM();
      // init related obj
      this._video = document.querySelector("#origin-stream video");
      this._canvas = document.querySelector("#processed-stream");
      this._context = this._canvas.getContext("2d");
      this.process();
    });
  },
  beforeDestroy() {
    this.originStream && this.originStream.close();
  }
};
</script>

<style scoped>
#origin-stream,
#processed-stream {
  width: 400px;
  height: 300px;
}
.auto-width {
  flex: 0 0 80px;
}
</style>
