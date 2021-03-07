<template>
  <div class="page">
    <form @submit.prevent="saveSettings">
      <h1>Settings</h1>
      <div>
        <h2>Background</h2>
        <input
          type="radio"
          id="color"
          value="color"
          v-model="settings.background.type"
        />
        <label for="color">Color</label>
        <div v-if="settings.background.type == 'color'">
          <br />
          <select id="colors" v-model="settings.background.colors">
            <option :value="['#cccccc', '#1e1f21']">Grey</option>
            <option :value="['#7fa9d5', '#042242']">Blue</option>
            <option :value="['#7fd5b1', '#012414']">Green</option>
            <option :value="['#cc7070', '#420606']">Red</option>
            <option :value="['#ceb75c', '#533908']">Yellow</option>
            <option :value="['#b6a1ce', '#4a0b5b']">Purple</option>
          </select>
        </div>
        <br />
        <input
          type="radio"
          id="image"
          value="image"
          v-model="settings.background.type"
        />
        <label for="image">Image</label>
        <div v-if="settings.background.type == 'image'">
          <br />
          <input
            type="text"
            v-model.trim="settings.background.image_url"
            placeholder="Image URL"
          />
        </div>
        <br />
      </div>
      <div>
        <h2>Windows</h2>
        <label for="apps_display">Apps</label>
        <select id="apps_display" v-model="settings.windows.apps">
          <option :value="true">Shown</option>
          <option :value="false">Hidden</option>
        </select>
        <br />
        <label for="terminal_display">Terminal</label>
        <select id="terminal_display" v-model="settings.windows.terminal">
          <option :value="true">Shown</option>
          <option :value="false">Hidden</option>
        </select>
        <br />
      </div>
      <div>
        <h2>Miscellaneous</h2>
        <label for="fullscreen">Fullscreen</label>
        <select id="fullscreen" v-model="settings.misc.fullscreen">
          <option :value="false">Disabled</option>
          <option :value="true">Enabled</option>
        </select>
      </div>
      <button type="submit">{{ saveMessage }}</button>
      <button type="button" @click="cancelForm">{{ exitMessage }}</button>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      settings: {
        background: {
          type: "color",
          colors: ["#cccccc", "#1e1f21"],
          image_url: "",
        },
        windows: {
          apps: true,
          terminal: true,
        },
        misc: {
          fullscreen: false,
        },
      },
      updateTicker: 0,
    };
  },
  watch: {
    settings: {
      handler() {
        this.applySettings();
      },
      deep: true,
    },
  },
  methods: {
    setCSS(variable, value) {
      this.$emit("set-css", { variable, value });
    },
    loadBackground() {
      const isDarkmode = window.matchMedia("(prefers-color-scheme: dark)")
        .matches;
      const color = isDarkmode
        ? this.settings.background.colors[1]
        : this.settings.background.colors[0];
      switch (this.settings.background.type) {
        case "color":
          this.setCSS("bg", color);
          break;
        case "image":
          this.setCSS("bg", "url(" + this.settings.background.image_url + ")");
      }
    },
    loadHidden() {
      const apps_display = this.settings.windows.apps ? "flex" : "none";
      this.setCSS("apps_display", apps_display);
      const terminal_display = this.settings.windows.terminal ? "flex" : "none";
      this.setCSS("terminal_display", terminal_display);
    },
    loadFullscreen() {
      const isFullscreen = this.settings.misc.fullscreen;
      const padding = isFullscreen ? "0rem" : "4rem";
      this.setCSS("window_padding", padding);
      const radius = isFullscreen ? "0rem" : "0.9rem";
      this.setCSS("radius", radius);
    },
    applySettings() {
      this.loadBackground();
      this.loadHidden();
      this.loadFullscreen();
    },
    saveSettings() {
      localStorage.setItem("settings", JSON.stringify(this.settings));
      this.updateTicker++;
      this.cancelForm();
    },
    loadSettings() {
      const settings = JSON.parse(localStorage.getItem("settings"));
      Object.keys(settings).forEach((setting) => {
        this.settings[setting] = settings[setting];
        console.log(this.settings[setting]);
      });
      this.$nextTick(function () {
        this.loadBackground();
      });
    },
    cancelForm() {
      this.$emit("cancel-form");
    },
    hasBeenChanged() {
      const stored_settings = localStorage.getItem("settings");
      const current_settings = JSON.stringify(this.settings);
      return current_settings == stored_settings;
    },
  },
  computed: {
    saveMessage() {
      this.updateTicker;
      return this.hasBeenChanged() ? "Save" : "Save changes";
    },
    exitMessage() {
      this.updateTicker;
      return this.hasBeenChanged() ? "Exit" : "Preview temporary changes";
    },
  },
  created() {
    this.loadSettings();
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        this.applySettings();
      });
  },
};
</script>

<style scoped>
.page {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

form {
  background-color: var(--popup_color);
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 0.05rem 0.4rem 0.3rem rgba(75, 75, 75, 0.103);
  backdrop-filter: blur(0.3rem);
  width: 30vw;
}

form > div {
  margin: 1rem 0;
}

h1 {
  font-size: 2.3rem;
  margin: 1rem 0;
}

h2 {
  font-size: 1.5rem;
}

label {
  margin-right: 1rem;
}
</style>