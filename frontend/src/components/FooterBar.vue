<template>
  <footer>
    <section class="left">
      <a id="logActionButton" href="/api/auth/logout">{{ logAction }}</a>
      <p class="version"><i>Othrys</i> v{{ getVersion }}</p>
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
        const response = await fetch("http://localhost:8080/api/system/stats");
        const data = await response.json();
        return (this.stats = {
          cpu: data.cpu,
          memory: [data.memory[0], data.memory[1]],
          temperature: data.temperature,
        });
      }
    },
    async machineAction(action) {
      await fetch("http://localhost:8080/api/system/" + action, {
        method: "POST",
      });
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
    getVersion() {
      return process.env.VUE_APP_VERSION;
    },
  },
  data() {
    return {
      stats: {
        cpu: "",
        memory: "",
        temperature: "",
      },
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
