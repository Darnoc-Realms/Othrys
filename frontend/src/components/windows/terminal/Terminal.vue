<template>
  <div class="container">
    <header>
      <div class="name">
        <button class="icon">
          <img src="./../../../assets/icons/down.png" />
        </button>
        <h1>
          {{ openProcess }}
        </h1>
      </div>
      <div>
        <button class="icon">
          <img src="./../../../assets/icons/large.png" />
        </button>
        <button class="icon">
          <img src="./../../../assets/icons/medium.png" />
        </button>
        <button class="icon">
          <img src="./../../../assets/icons/small.png" />
        </button>
      </div>
      <button class="icon">
        <img src="./../../../assets/icons/download.png" />
      </button>

      <actions :options="getActions()" :app-name="'test'" :app-id="'1'" />

      <button class="icon">
        <img src="./../../../assets/icons/search.png" />
      </button>

      <button class="icon">
        {{ addButton }}
      </button>
    </header>
    <div class="contents">
      <tabs @changed="tabChanged">
        <tab
          v-for="process in processesList"
          :key="process.id"
          :name="process.name"
        >
          <VueTerminal
            console-sign="$"
            allow-arbitrary
            height="500px"
            @command="onCliCommand"
          ></VueTerminal>
        </tab>
      </tabs>
    </div>
  </div>
</template>

<script>
import Actions from "../../Actions.vue";
import { Tabs, Tab } from "vue-tabs-component";
import VueTerminal from "vue-terminal-ui";

export default {
  components: {
    Actions,
    Tabs,
    Tab,
    VueTerminal,
  },
  props: {
    authenticated: {
      type: Boolean,
      required: false,
    },
  },
  methods: {
    getActions() {
      let actions = [];
      const id = "test";
      actions.push(
        ["Stop", `/api/app/${id}?action=stop`],
        ["Restart", `/api/app/${id}?action=restart`]
      );
      actions.push(
        ["Start", `/api/app/${id}?action=start`],
        ["Update", `/api/app/${id}?action=update`]
      );
      return actions;
    },
    tabChanged(selectedTab) {
      const index = this.processesList.findIndex(
        (x) => x.name == selectedTab.tab.name
      );
      this.selectedTabId = this.processesList[index].id;
    },
    onCliCommand(data, resolve) {
      // typed command is available in data.text
      // don't forget to resolve or reject the Promise
      console.log(resolve);
      resolve("what?");
    },
  },
  computed: {
    openProcess() {
      return this.processesList[
        this.processesList.findIndex((x) => x.id == this.selectedTabId)
      ].name;
    },
    addButton() {
      if (!this.inAddView) {
        return "＋";
      } else {
        return "－";
      }
    },
  },
  data() {
    return {
      inAddView: false,
      selectedTabId: "",
      processesList: [
        {
          name: "Minecraft",
          id: "1",
        },
        {
          name: "Nginx",
          id: "2",
        },
      ],
    };
  },
  created() {
    this.selectedTabId = this.processesList[0].id;
  },
};
</script>

<style scoped>
header {
  display: flex;
  padding: 0.5rem 0rem;
}

header > div {
  display: flex;
  align-items: center;
}

header > div.name {
  flex: 2 0 auto;
}

.container {
  overflow: hidden;
}

button.icon {
  width: 2rem;
  height: 2rem;
  background: none;
  border: none;
  font-size: 1.6rem;
  font-weight: 400;
  padding: 0.2rem 0.6rem;
  border-radius: 0.5rem;
  cursor: pointer;
  color: var(--light_text);
  stroke: var(--light_text);
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 1rem;
}

button.icon > img {
  width: 1.4rem;
  filter: invert(55%);
}

button.icon:hover > img {
  filter: invert(90%);
}

button.icon:hover {
  background-color: var(--light_color);
  color: var(--hover_text);
  stroke: var(--hover_text);
}

button.icon.active {
  background-color: var(--active-color);
  color: white;
}

@media only screen and (max-width: 575px) and (orientation: portrait) {
  footer > section.left {
    display: none;
  }
}
</style>

<style>
.tabs-component-tabs {
  align-items: stretch;
  display: flex;
  justify-content: flex-start;
  margin-top: 0;
  padding: 0;
  list-style: none;
}

.tabs-component-tab {
  flex: 2 0 auto;
}

.tabs-component-tab.is-active {
  z-index: 2;
  transform: translateY(0);
  background-color: rgba(0, 0, 0, 0.27);
}

.tabs-component-tab-a {
  align-items: center;
  color: inherit;
  display: flex;
  padding: 0.75em 1em;
  text-decoration: none;
}
</style>
