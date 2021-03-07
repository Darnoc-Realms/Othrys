<template>
  <div class="container">
    <header>
      <div class="name">
        <button class="icon" @click="scrollToBottom" title="Scroll to bottom">
          <img src="./../../../assets/icons/down.png" />
        </button>
        <h1>
          {{ openProcess }}
        </h1>
      </div>
      <div class="sizing" title="Change the terminal font size">
        <button class="icon" @click="setSize('large')">
          <img src="./../../../assets/icons/large.png" />
        </button>
        <button class="icon" @click="setSize('medium')">
          <img src="./../../../assets/icons/medium.png" />
        </button>
        <button class="icon" @click="setSize('small')">
          <img src="./../../../assets/icons/small.png" />
        </button>
      </div>
      <button class="icon" @click="downloadLog" title="Download log">
        <img src="./../../../assets/icons/download.png" />
      </button>

      <button class="icon" @click="toggleSearch" title="Search lines">
        <img src="./../../../assets/icons/search.png" />
      </button>

      <actions
        :options="getActions()"
        :app-name="'test'"
        :app-id="'1'"
        class="actions"
      />

      <button class="icon" title="Create new process" @click="toggleAddView">
        {{ addButton }}
      </button>
    </header>
    <div v-if="ready" v-show="!inAddView">
      <tabs @changed="tabChanged" :options="{ useUrlFragment: false }">
        <tab
          v-for="(process, id) in processes"
          :key="id"
          :id="process.id"
          :name="process.name"
        >
          <terminal-tab :ref="id" :id="process.id" :name="process.name" />
        </tab>
      </tabs>
    </div>
    <div v-if="inAddView">
      <new-item-form
        itemName="Process"
        :fields="[
          { id: 0, name: 'name', title: 'Process Name', type: 'String' },
          {
            id: 1,
            name: 'shortcuts',
            title: 'Shortcuts',
            type: 'Array',
            options: [
              ['name', 'Name'],
              ['path', 'Path to .sh file'],
            ],
          },
        ]"
      />
    </div>
  </div>
</template>

<script>
import Actions from "../../Actions";
import { Tabs, Tab } from "vue-tabs-component";
import TerminalTab from "./TerminalTab";
import NewItemForm from "../../NewItemForm";

export default {
  components: {
    Actions,
    Tabs,
    Tab,
    TerminalTab,
    NewItemForm,
  },
  props: {
    authenticated: {
      type: Boolean,
      required: false,
    },
  },
  watch: {
    ready: function() {
      this.$socket.emit("catchup");
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
      const keys = Object.keys(this.processes);
      this.selectedTabId = keys.find((id) => id == selectedTab.tab.id);
      this.focusInput();
    },
    scrollToBottom() {
      this.$refs[this.selectedTabId][0].forceScroll();
    },
    downloadLog() {
      this.$refs[this.selectedTabId][0].downloadLog();
    },
    setSize(size) {
      Object.keys(this.processes).forEach((id) => {
        this.$refs[id][0].setSize(size);
      });
    },
    toggleSearch() {
      this.$refs[this.selectedTabId][0].toggleSearch();
    },
    focusInput() {
      this.$refs[this.selectedTabId][0].focusInput();
    },
    toggleAddView() {
      if (!this.inAddView) {
        this.inAddView = true;
      } else {
        this.inAddView = false;
      }
    },
  },
  computed: {
    openProcess() {
      return this.processes[this.selectedTabId]
        ? this.processes[this.selectedTabId].name
        : "";
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
      processes: {},
      ready: false,
    };
  },
  sockets: {
    connect: function () {
      console.log("socket connected");
      const socket_token = localStorage.getItem("socket_token");
      if (socket_token) {
        this.$socket.emit("check", { socket_token: socket_token });
      }
    },
    new_session: function (data) {
      this.processes[data.id] = { name: data.name, id: data.id };
      this.selectedTabId = !this.selectedTabId ? data.id : this.selectedTabId;
      if (data.total == Object.keys(this.processes).length) {
        this.ready = true;
      }
    },
    new_lines: function (data) {
      this.$refs[data.id][0].addLines(data.lines);
      this.$refs[data.id][0].maybeScroll();
    },
    authenticated: function (data) {
      if (data.socket_token) {
        localStorage.setItem("socket_token", data.socket_token);
      }
      this.$emit("authenticated");
      this.$socket.emit("sessions");
    },
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

header > div.name > button {
  margin-right: 0.7rem;
}

header > * {
  margin: 0 0.5rem;
}

header > div.actions {
  display: block;
  color: var(--medium_text);
  padding-right: 0;
}

header > div.sizing > button.icon {
  margin: 0;
}

header > div.sizing > button.icon:nth-child(1) {
  border-radius: 0.5rem 0 0 0.5rem;
}

header > div.sizing > button.icon:nth-child(2) {
  border-radius: 0;
}

header > div.sizing > button.icon:nth-child(3) {
  border-radius: 0 0.5rem 0.5rem 0;
}

header > div.sizing > button.icon:not(:first-child):after {
  border-left: 0.13rem solid var(--light_color);
  content: "";
  width: 2rem;
  height: 2rem;
  position: absolute;
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
}

button.icon > img {
  width: 1.4rem;
  filter: invert(55%);
}

button.icon:hover > img {
  filter: invert(30%);
}

@media (prefers-color-scheme: dark) {
  button.icon:hover > img {
    filter: invert(90%);
  }
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
  margin: 0;
  padding: 0;
  list-style: none;
  border-bottom: 0.14rem solid var(--dark_color);
  cursor: pointer;
}

.tabs-component-tab {
  flex: 2 0 auto;
  background-color: rgba(0, 0, 0, 0.068);
  border-right: 0.07rem solid var(--medium_color);
  border-left: 0.07rem solid var(--medium_color);
  box-shadow: 0 0.2rem 0.5rem -0.1rem rgba(0, 0, 0, 0.2) inset;
}

.tabs-component-tab:first-child {
  border-left: none;
}

.tabs-component-tab:last-child {
  border-right: none;
}

.tabs-component-tab-a {
  align-items: center;
  color: inherit;
  display: flex;
  padding: 0.75em 1em;
  text-decoration: none;
  justify-content: center;
}

.tabs-component-tab.is-active {
  z-index: 2;
  background-color: var(--bar_color);
  box-shadow: none;
}
</style>
