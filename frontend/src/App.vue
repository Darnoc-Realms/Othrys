<template>
  <div id="app">
    <auth-form v-if="!authenticated" @logged_in="login" :state="state" />
    <div
      class="windows"
      v-bind:class="{ blur: !authenticated }"
      ref="needsToNotBeFocusable"
    >
      <apps />
    </div>
    <notifications position="bottom right" :ignore-duplicates="true" />
    <footer-bar :authenticated="authenticated"/>
  </div>
</template>

<script>
import FooterBar from "./components/FooterBar.vue";
import Apps from "./components/windows/apps/Apps.vue";
import AuthForm from "./components/auth/AuthForm.vue";

export default {
  name: "App",
  components: {
    FooterBar,
    Apps,
    AuthForm,
  },
  data() {
    return {
      authenticated: false,
      state: "",
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
      this.focusableWindows(true)
      this.authenticated = true
    },
  },
  async beforeCreate() {
    const response = await fetch("http://localhost:8080/api/auth/status");
    const data = await response.json();
    this.authenticated = data[0];
    return this.authenticated;
  },
  mounted() {
    this.focusableWindows(false)
  },
};
</script>

<style>
:root {
  /* Colors */
  --bg_color: #cccccc;
  --bar_color: rgba(255, 255, 255, 0.5);
  --container_color: rgba(255, 255, 255, 0.9);
  --thick_color: rgba(240, 240, 240, 0.8);
  --active-color: rgba(0, 0, 0, 0.4);
  --light_color: rgba(0, 0, 0, 0.1);
  --medium_color: rgba(0, 0, 0, 0.2);
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
  --radius_top: 0.9rem 0.9rem 0 0;
  --radius_bottom: 0 0 0.9rem 0.9rem;
}

@media (prefers-color-scheme: dark) {
  :root {
    /* Colors */
    --bg_color: #1e1f21;
    --bar_color: rgba(255, 255, 255, 0.15);
    --container_color: rgba(255, 255, 255, 0.25);
    --thick_color: rgba(46, 46, 46, 0.925);
    --light_color: rgba(255, 255, 255, 0.1);
    --active-color: rgba(0, 0, 0, 0.2);
    --bright_text: black;
    --light_text: #9c9c9c;
    --medium_text: #d6d6d6;
    --dark_text: #f3f3f3;
    --hover_text: white;
    --blue: #064699;
  }
}

html, body {
  height: 100%;
}

body {
  background-color: var(--bg_color);
}

#app {
  margin: none;
  padding: none;
  color: var(--dark_text);
  font-size: var(--font_size);
  font-family: var(--font_family);
  overflow-x: hidden;
  height: 100%;
  width: 100%;
}

.thin {
  font-weight: 200;
}

.windows {
  padding: 4rem;
  transition: filter 0.6s ease-out;
}

.windows.blur {
  filter: blur(0.3rem) brightness(0.9);
  pointer-events: none;
  user-select: none; /* Standard */
}

.container > .contents {
  background-color: var(--container_color);
  border-radius: var(--radius_bottom);
}

header {
  background-color: var(--bar_color);
  border-radius: var(--radius_top);
  padding: 0.5rem 1.5rem;
  display: grid;
  grid-template-columns: auto 3rem;
  align-items: center;
}

button:focus,
input:focus {
  outline: 0;
}
</style>