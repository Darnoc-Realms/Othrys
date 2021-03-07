<template>
  <div id="app" ref="app">
    <transition name="slide">
      <auth-form
        v-if="!authenticated"
        @logged_in="login"
        :in-setup="inSetup"
        class="auth_form"
      />
    </transition>
    <settings
      v-show="inSettings"
      @cancel-form="toggleSettings(false)"
      @set-css="setCSSVariable"
    />
    <div
      class="windows"
      v-bind:class="{ blur: blurred }"
      ref="needsToNotBeFocusable"
    >
      <apps :authenticated="authenticated" id="apps" />
      <terminal
        :authenticated="authenticated"
        @authenticated="focusableWindows(true)"
        id="terminal"
      />
    </div>
    <notifications
      position="bottom right"
      :ignore-duplicates="false"
      classes="notif"
      :max="3"
    />
    <footer-bar
      :authenticated="authenticated"
      :in-settings="inSettings"
      @toggle-settings="toggleSettings(!inSettings)"
      ref="footerBar"
    />
  </div>
</template>

<script>
import FooterBar from "./components/FooterBar.vue";
import Apps from "./components/windows/apps/Apps.vue";
import AuthForm from "./components/auth/AuthForm.vue";
import Terminal from "./components/windows/terminal/Terminal.vue";
import Settings from "./components/settings/Settings.vue";

export default {
  name: "App",
  components: {
    FooterBar,
    Apps,
    Terminal,
    AuthForm,
    Settings,
  },
  data() {
    return {
      authenticated: false,
      state: "",
      inSettings: false,
    };
  },
  methods: {
    focusableWindows(boolean) {
      function recursiveUnfocusable(el) {
        el.disabled = !boolean;
        [...el.children].forEach(recursiveUnfocusable);
      }
      recursiveUnfocusable(this.$refs.needsToNotBeFocusable);
    },
    login() {
      this.focusableWindows(true);
      this.authenticated = true;
    },
    toggleSettings(state) {
      this.inSettings = state;
    },
    setCSSVariable(data) {
      console.log(data)
      this.$refs.app.style.setProperty("--" + data.variable, data.value);
    },
  },
  computed: {
    inSetup() {
      return this.state == "setup" ? true : false;
    },
    blurred() {
      return this.authenticated == false || this.inSettings;
    },
  },
  beforeCreate() {
    this.getAPI("auth/status").then((data) => {
      this.authenticated = data[0];
      this.state = data[1];
    });
  },
  mounted() {
    if (!this.authenticated) {
      this.focusableWindows(false);
    }
  },
};
</script>

<style lang="scss">
#app {
  /* Colors */
  --bg: #cccccc;
  --bar_color: rgba(255, 255, 255, 0.5);
  --container_color: rgba(255, 255, 255, 0.9);
  --popup_color: rgba(255, 255, 255, 0.8);
  --thick_color: rgba(240, 240, 240, 0.9);
  --active-color: rgba(0, 0, 0, 0.4);
  --light_color: rgba(0, 0, 0, 0.1);
  --medium_color: rgba(0, 0, 0, 0.2);
  --dark_color: rgba(0, 0, 0, 0.4);
  --bright_text: white;
  --light_text: #6f6f6f;
  --medium_text: #484848;
  --dark_text: #1a1a1a;
  --hover_text: black;
  --red: #f77864;
  --yellow: #f8c33d;
  --green: #67bf57;
  --blue: #1c77e4;
  --dark_red: #6a190e;
  --dark_yellow: #a89a2d;
  --dark_green: #3b7630;
  /* Fonts */
  --font_size: 16px;
  --font_family: Avenir, Inter, -apple-system, BlinkMacSystemFont, Segoe UI,
    Oxygen, Ubuntu, Roboto, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
    sans-serif;
  --radius_bottom: 0 0 0.9rem 0.9rem;
  /* JS */
  --apps_display: flex;
  --terminal_display: flex;
  --window_padding: 4rem;
  --radius: 0.9rem;
}

@media (prefers-color-scheme: dark) {
  #app {
    /* Colors */
    --bg: #1e1f21;
    --bar_color: rgba(255, 255, 255, 0.15);
    --container_color: rgba(255, 255, 255, 0.26);
    --popup_color: rgba(44, 44, 44, 0.582);
    --thick_color: rgba(46, 46, 46, 0.925);
    --light_color: rgba(255, 255, 255, 0.1);
    --medium_color: rgba(255, 255, 255, 0.2);
    --dark_color: rgba(179, 179, 179, 0.3);
    --active-color: rgba(0, 0, 0, 0.2);
    --bright_text: black;
    --light_text: #9c9c9c;
    --medium_text: #d6d6d6;
    --dark_text: #f3f3f3;
    --hover_text: white;
    --blue: #064699;
  }
}

html,
body {
  height: 100%;
}

body {
  background-color: unset;
}

#app {
  background: var(--bg);
  background-repeat: no-repeat;
  background-size: cover;
  color: var(--dark_text);
  font-size: var(--font_size);
  font-family: var(--font_family);
  overflow-x: hidden;
  height: 100%;
  width: 100%;
  transition: background-color 0.3s ease-in;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.thin {
  font-weight: 200;
}

#apps {
  display: var(--apps_display);
}

#terminal {
  display: var(--terminal_display);
}

.windows {
  padding: var(--window_padding);
  transition: filter 0.6s ease-out;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  & > div {
    flex: 1;
  }
  & > div:first-child {
    flex: 0.55;
    margin-right: calc(var(--window_padding) / 2.3 + 0.5rem);
  }
}

.windows.blur {
  filter: blur(0.3rem) brightness(0.9);
  pointer-events: none;
  user-select: none; /* Standard */
}

.container {
  box-shadow: 0 0.05rem 0.4rem 0.3rem rgba(75, 75, 75, 0.103);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
}

.container > .contents {
  background-color: var(--container_color);
}

header {
  background-color: var(--bar_color);
  padding: 0.5rem 0rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

button:focus,
input:focus {
  outline: 0;
}

// style of the notification itself
.notif {
  border-radius: 0.6rem;
  padding: 0.6rem 0.6rem;
  margin: 0rem 1.5rem 0rem 0;
  background: rgba(255, 255, 255, 0.541) !important;
  backdrop-filter: blur(0.3rem) brightness(1.1);
  box-shadow: 0 0.05rem 0.4rem 0.3rem rgba(75, 75, 75, 0.103);
  border: 0.05rem solid rgba(0, 0, 0, 0.1);

  // style for title line
  .notification-title {
    margin-top: 0.8rem;
    font-size: 0.9rem;
  }

  .notification-title::before {
    content: "INFO";
    position: absolute;
    font-size: 0.54rem;
    margin-top: -0.8rem;
    font-weight: thin;
    word-spacing: 0.2rem;
  }

  // style for content
  .notification-content {
    font-size: 0.85rem;
  }

  // additional styling hook when using`type` parameter, i.e. this.$notify({ type: 'success', message: 'Yay!' })
  &.success {
    background: rgba(33, 207, 76, 0.733) !important;
    .notification-title::before {
      content: "✅ SUCCESS";
    }
  }
  &.warn {
    background: rgba(255, 189, 66, 0.774) !important;
    .notification-title::before {
      content: "⚠ WARNING";
    }
  }
  &.error {
    background: rgba(248, 121, 121, 0.808) !important;
    .notification-title::before {
      content: "❌ ERROR";
    }
  }
}

.vue-notification-wrapper {
  padding: 0.5rem !important;
}

.vue-notification-group {
  margin-bottom: 4rem;
}

.auth_form {
  z-index: 100;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 2s;
}
.slide-enter, .slide-leave-to /* .fade-leave-active below version 2.1.8 */ {
  transform: translateY(-100vh);
  opacity: 0.3;
}
</style>