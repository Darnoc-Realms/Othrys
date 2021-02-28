<template>
  <footer>
    <section class="left">
      <a id="logActionButton" @click="doLogAction" href="#">{{ logAction }}</a>
      <p class="version"><i>Othrys</i> v{{ version }}</p>
    </section>
    <section class="right" v-if="authenticated">
      <p class="stats" ref="stats">{{ formatStats }}</p>
      <button
        title="Restart"
        class="control yellow"
        @click="machineAction('restart')"
      ></button
      ><button
        title="Shutdown"
        class="control red"
        @click="machineAction('shutdown')"
      ></button>
    </section>
  </footer>
</template>

<script>
export default {
  props: {
    authenticated: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    async updateStats() {
      if (this.authenticated) {
        this.getAPI("system/stats").then((data) => {
          return (this.stats = {
            cpu: data.cpu,
            memory: [data.memory[0], data.memory[1]],
            temperature: data.temperature,
          });
        });
      }
    },
    async machineAction(action) {
      this.axios
        .post("system/" + action)
        .then(() => {
          this.$notify({
            title: `Sent "${action}"`,
            text: "The panel will lose access to the server shortly",
          });
        })
        .catch((error) => {
          this.$notify({
            title: "Action Error",
            type: "error",
            text: error.response.statusText,
          });
        });
    },
    doLogAction() {
      if (this.authenticated) {
        this.axios
          .post("auth/logout")
          .then(() => {
            window.location.href = "/";
          })
          .catch((error) => {
            this.$notify({
              title: "Logout Error",
              type: "error",
              text: error.response.data,
            });
          });
      } else {
        window.location.href = "/";
      }
    },
  },
  computed: {
    logAction() {
      if (this.authenticated) {
        return "Logout";
      } else {
        return "Login";
      }
    },
    formatStats() {
      return (
        (this.stats.cpu ? `CPU: ${this.stats.cpu}%` : "") +
        (this.stats.memory
          ? ` | MEM: ${this.stats.memory[0] + "/" + this.stats.memory[1]} gb`
          : "") +
        (this.stats.temperature ? ` | TEMP: ${this.stats.temperature}°C` : "")
      );
    },
  },
  data() {
    return {
      stats: {
        cpu: "",
        memory: "",
        temperature: "",
      },
      version: process.env.VUE_APP_VERSION,
      timer: "",
    };
  },
  created() {
    setTimeout(this.updateStats, 100);
    this.timer = setInterval(this.updateStats, 10000);
  },
};
</script>

<style scoped>
footer {
  width: 100%;
  position: absolute;
  bottom: 0;
  background-color: var(--bar_color);
  font-size: 1rem;
  display: flex;
  filter: drop-shadow(0 0rem 0.5rem rgba(0, 0, 0, 0.1));
}

footer > section {
  width: 50%;
  display: flex;
  align-items: center;
  padding: 0.4rem 1rem 0.4rem 0.5rem;
}

footer > section > * {
  margin: 0.4rem;
}

footer > section.right {
  width: 50%;
  justify-content: flex-end;
}

button.control {
  width: 1rem;
  height: 1rem;
  border-radius: 1rem;
  border: none;
  cursor: pointer;
}

button.control.red {
  background-color: var(--red);
}

button.control.red:hover {
  background-color: var(--dark_red);
}

button.control.yellow {
  background-color: var(--yellow);
}

button.control.yellow:hover {
  background-color: var(--dark_yellow);
}

a#logActionButton {
  color: var(--dark_text);
}

p.version {
  color: var(--light_text);
  font-size: 0.94rem;
}

p.stats {
  color: var(--medium_text);
  font-size: 0.94rem;
}

@media only screen and (max-width: 640px) and (orientation: portrait) {
  footer > section.left {
    display: none;
  }
  footer > section.right {
    width: 100%;
    justify-content: center;
  }
}
</style>
