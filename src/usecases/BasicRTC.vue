<template>
    <v-container>
      <v-layout
        wrap
      >
        <!-- sidebar form -->
        <v-flex xs12 md4>

          <!-- basic settings -->
          <v-card>
            <v-card-text>
              <v-text-field
                v-model="appId"
                label="App ID"
                :disabled="joined"
              />
              <v-text-field
                v-model="channelName"
                label="Channel Name"
                :disabled="joined"
              />
              <v-select
                v-model="attendeeMode"
                :items="attendeeModes"
                label="Attendee Mode"
                :disabled="joined"
              ></v-select>
            </v-card-text>
            <v-card-actions>
              <v-layout>
                <v-flex md6 v-show="!joined">
                  <v-btn :loading="initializing" color="info" @click="initialize">Start</v-btn>
                </v-flex>
                <v-flex md6 v-show="joined">
                  <v-btn color="error" @click="leave" >Leave</v-btn>

                </v-flex>
                <v-flex md6 v-show="!published">
                  <v-btn color="success" @click="publish" :disabled="!joined || attendeeMode === 0b00" >Publish</v-btn>

                </v-flex>
                <v-flex md6 v-show="published">
                  <v-btn color="error" @click="unpublish">Unpublish</v-btn>
                </v-flex>
              </v-layout>
            </v-card-actions>
          </v-card>

          <!-- advanced settings -->
          <v-expansion-panel :disabled="joined" dark style="margin-top: 10px">
            <v-expansion-panel-content expand-icon="">
              <div slot="header" style="text-align: center">Advanced Settings</div>
              <v-card>
                <v-card-text>
                  <v-text-field
                    v-model="streamId"
                    label="Stream ID"
                  />
                  <v-text-field
                    v-model="token"
                    label="Token"
                  />
                  <v-select
                    v-model="videoProfile"
                    :items="videoProfiles"
                    label="Video Profile"
                  ></v-select>
                  <v-select
                    v-model="cameraId"
                    :items="cameras"
                    label="Cameras"
                  ></v-select>
                  <v-select
                    v-model="microphoneId"
                    :items="microphones"
                    label="Microphones"
                  ></v-select>
                  <v-radio-group v-model="mode" row>
                    <div slot="label">Mode</div>
                    <v-radio label="live" value="live"></v-radio>
                    <v-radio label="rtc" value="rtc"></v-radio>
                  </v-radio-group>
                  <v-radio-group v-model="codec" row>
                    <div slot="label">Codec</div>
                    <v-radio label="h264" value="h264"></v-radio>
                    <v-radio label="vp8" value="vp8"></v-radio>
                  </v-radio-group>
                  <v-select
                    v-model="logLevel"
                    :items="logLevels"
                    label="Log Level"
                    hint="Level besides 'None' will enable log upload"
                  ></v-select>
                </v-card-text>

              </v-card>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-flex>

        <!-- display area -->
        <v-flex xs12 md8>
          <div class="stream-player" v-if="localUser" :id="'stream-player-local-'+localUser.id">
            <span class="stream-player-tag">local</span>
          </div>
          <div class="stream-player" v-for="item in remoteUsers" :id="'stream-player-'+item.id" :key="item.id">
            <span class="stream-player-tag">{{item.id}}</span>
          </div>
        </v-flex>

        <!-- snackbar -->
        <v-snackbar
          v-model="snackbar"
          :color="color"
          top
          :timeout="timeout"
        >{{text}}</v-snackbar>
      </v-layout>
    </v-container>
</template>

<script>
import AgoraRTC from '../utils/AgoraUtils'
export default {
  data() {
    this.logLevels = [
      { text: "Debug", value: AgoraRTC.Logger.DEBUG },
      { text: "Info", value: AgoraRTC.Logger.INFO },
      { text: "Warning", value: AgoraRTC.Logger.WARNING },
      { text: "Error", value: AgoraRTC.Logger.ERROR },
      { text: "None", value: AgoraRTC.Logger.NONE }
    ];
    this.videoProfiles = [
      { text: "Low", value: "120p" },
      { text: "Standard", value: "480p_2" },
      { text: "High", value: "720p_3" }
    ];
    return {
      // agora related
      appId: "",
      channelName: "",
      token: null,
      streamId: undefined,
      mode: "live",
      codec: "vp8",
      attendeeMode: 0b11,
      attendeeModes: [
        { text: "Video & Audio", value: 0b11 },
        { text: "Audio Only", value: 0b01 },
        { text: "Audience", value: 0b00 }
      ],
      logLevel: AgoraRTC.Logger.NONE,
      cameraId: undefined,
      microphoneId: undefined,
      cameras: [],
      microphones: [],
      videoProfile: "480p_3",
      // stream management
      localUser: null,
      remoteUsers: [],
      // snackbar related
      snackbar: false,
      color: "",
      timeout: 5000,
      text: "",
      // client state
      joined: false,
      published: false,
      // action state
      initializing: false
      // publishing: false,
      // leaving: false
    };
  },

  methods: {
    async initialize() {
      this.initializing = true;
      // appId and channelName are required
      if (!this.appId || !this.channelName) {
        this.initializing = false;
        return this.notify("App ID and Channel Name are required!", "error");
      }
      let client, stream;
      client = AgoraRTC.createClient({
          mode: this.mode,
          codec: this.codec
        })
      try {
        // init client and sub events
        this.subClientEvts(client);
        await client.init(this.appId);
        // join channel and get assignedId (equal to this.streamId if exists)
        let assignedId = await client.join(
          this.token,
          this.channelName,
          Number(this.streamId)
        );

        stream = AgoraRTC.createStream({
            streamID: assignedId,
            video: Boolean(this.attendeeMode & 0b10),
            audio: Boolean(this.attendeeMode & 0b01),
            screen: false,
            cameraId: this.cameraId,
            microphoneId: this.microphoneId
          })
        // if audience
        if (this.attendeeMode !== 0b00) {
          // set video profile and init
          stream.setVideoProfile(this.videoProfile);
          await stream.init();
          await client.publish(stream);
          this.published = true;
          this.localUser = { stream: stream, id: stream.getId() };
          this.$nextTick(() => {
            this.localUser.stream.play("stream-player-local-" + stream.getId());
          });
        }

        this.client = client;
        this.joined = true;
        this.notify("Initialized", "success");
      } catch (err) {
        console.error(err);
        this.notify(this._parseError(err), "error");
      } finally {
        this.initializing = false;
      }
    },

    subClientEvts(client) {
      client.on("error", err => {
        this.notify("Got a client error " + err.reason, "error");
      });

      client.on("stream-added", evt => {
        let stream = evt.stream;
        let id = stream.getId();
        let index = this.remoteUsers.findIndex(item => item.id === id);
        if (index !== -1) {
          return;
        }
        this.notify("New stream added: " + stream.getId(), "info");
        client.subscribe(stream, err => {
          this.notify(
            "Subscribe stream failed " + this._parseError(err),
            "error"
          );
        });
      });

      client.on("stream-subscribed", evt => {
        let stream = evt.stream;
        this.notify(
          "Subscribe remote stream successfully: " + stream.getId(),
          "info"
        );
        // add stream
        this.remoteUsers.push({ stream: stream, id: stream.getId() });
        this.$nextTick(() => {
          stream.play("stream-player-" + stream.getId());
        });
      });

      client.on("stream-removed", evt => {
        let stream = evt.stream;
        stream.stop();
        this.notify("Remote stream is removed " + stream.getId(), "info");
        // remove stream
        let id = stream.getId();
        let index = this.remoteUsers.findIndex(item => item.id === id);
        if (index !== -1) {
          this.remoteUsers.splice(index, 1);
        }
      });

      client.on("peer-leave", evt => {
        let stream = evt.stream;
        if (stream) {
          stream.stop();
          this.notify(evt.uid + " leaved from this channel", "info");
          // remove stream
          let id = stream.getId();
          let index = this.remoteUsers.findIndex(item => item.id === id);
          if (index !== -1) {
            this.remoteUsers.splice(index, 1);
          }
        }
      });
    },

    async leave() {
      // this.leaving = true;
      try {
        if (this.attendeeMode !== 0b00) {
          this.localUser.stream.close();
          this.client.unpublish(this.localUser.stream);
          this.published = false;
          this.localUser = null;
        }
        this.client.leave();
        this.client = null;
        this.remoteUsers = [];
        this.notify("You have left the room", "info");
        this.joined = false;
      } catch (err) {
        console.error(err);
        this.notify(err);
      } finally {
        // this.leaving = false;
      }
    },

    async publish() {
      // this.publishing = true;
      try {
        await this.client.publish(this.localUser.stream);
        this.notify("Publish successfully", "success");
        this.published = true;
      } catch (err) {
        this.notify(this._parseError(err), "error");
      } finally {
        // this.publishing = false;
      }
    },

    async unpublish() {
      this.client.unpublish(this.localUser.stream, err => {
        this.notify(this._parseError(err), "error");
      });
      this.notify("Unpublishing stream", "info");
      this.published = false;
    },

    /**
     * @param {'info'|'success'|'error'} type - notify level
     */
    notify(msg, type = "info") {
      this.snackbar = true;
      this.color = type;
      this.text = msg;
    },

    _parseError(err) {
      if (err instanceof Error) {
        return String(err);
      } else {
        return JSON.stringify(err);
      }
    }
  },

  mounted() {
    this.$nextTick(() => {
      AgoraRTC.getDevices(devices => {
        let cameras = [];
        let microphones = [];
        for (let item of devices) {
          if (item.kind === "audioinput") {
            microphones.push({
              text: item.label,
              value: item.deviceId
            });
          } else if (item.kind === "videoinput") {
            cameras.push({
              text: item.label,
              value: item.deviceId
            });
          } else {
            // do nothing
          }
        }
        this.cameras = cameras;
        this.microphones = microphones;
      });
    });
  }
};
</script>

<style scoped>
.stream-player {
  width: 240px;
  height: 180px;
  margin: 15px;
  position: relative;
}
.stream-player-tag {
  position: absolute;
  z-index: 99;
  left: 3px;
  top: 3px;
  color: white;
}
</style>
