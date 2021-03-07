<template>
  <div class="container">
    <header>
      <h1>
        Apps <span class="thin">{{ appCount }} </span>
      </h1>
      <button
        title="Create new app"
        class="add_app"
        @click="toggleAddView"
        v-bind:class="{ active: inAddView }"
      >
        {{ addButton }}
      </button>
    </header>
    <div class="contents">
      <table v-if="!inAddView">
        <tbody>
          <app-item
            v-for="app in appList"
            :key="app.id"
            :id="app.id"
            :name="app.name"
            :desc="app.desc"
            :status="app.status"
            :last_changed="app.last_changed"
          />
        </tbody>
      </table>
      <new-app-form v-if="inAddView" @new-app-cancelled="toggleAddView" />
    </div>
  </div>
</template>

<script>
// TODO: Make socket code invalid on logout
import AppItem from "./AppItem.vue";
import NewAppForm from "./NewAppForm.vue";

export default {
  components: {
    AppItem,
    NewAppForm,
  },
  props: {
    authenticated: {
      type: Boolean,
      required: false,
    },
  },
  methods: {
    toggleAddView() {
      if (!this.inAddView) {
        this.inAddView = true;
      } else {
        this.inAddView = false;
      }
    },
  },
  computed: {
    addButton() {
      if (!this.inAddView) {
        return "＋";
      } else {
        return "－";
      }
    },
    appCount() {
      return this.appList.length;
    },
  },
  data() {
    return {
      inAddView: false,
      appList: [
        {
          name: "Coeus",
          desc: "Discord bot",
          id: "1",
          status: 1,
          last_changed: 1614240140823,
        },
        {
          name: "Theta",
          desc: "Discord bot",
          id: "2",
          status: 2,
          last_changed: 1614241224369,
        },
        {
          name: "Card-mailer",
          desc: "Express Server",
          id: "3",
          status: 0,
          last_changed: 1614240140823,
        },
      ],
    };
  },
  created() {},
};
</script>

<style scoped>
.container {
  overflow: hidden;
}

header>*{
  margin: 0 0.5rem;
}

h1 {
  margin-left: 1rem;
}

button.add_app {
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
  display: flex;
  justify-content: center;
  align-items: center;
}

button.add_app:hover {
  background-color: var(--light_color);
  color: var(--hover_text);
}

button.add_app.active {
  background-color: var(--active-color);
  color: white;
}

table {
  width: 100%;
  border-collapse: collapse;
  color: var(--medium_text);
  line-height: 1.5rem;
}

.contents {
  flex: 1;
}

@media only screen and (max-width: 575px) and (orientation: portrait) {
  footer > section.left {
    display: none;
  }
}
</style>
