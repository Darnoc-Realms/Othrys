<template>
  <tr>
    <td>
      <span class="bold dark">{{ name }}</span><br />
      <span class="discrete">{{ desc }}</span>
    </td>
    <td>
      <span :class="statusClass">●</span><span class="bold"> {{ statusText }}</span><br />
      <span class="discrete small">{{ sinceMessage }}</span>
    </td>
    <td class="actions_cell"><actions :options="getActions()" :app-name="name" :app-id="id" /></td>
  </tr>
</template>

<script>
import Actions from "../../Actions.vue";

export default {
  components: {
    Actions,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    status: {
      type: Number,
      required: true,
    },
    last_changed: {
      type: Number,
      required: true,
    },
  },
  methods: {
    getActions() {
      let actions = []
      if (this.status == 1) {
        actions.push(["Stop", `/api/app/${this.id}?action=stop`], ["Restart", `/api/app/${this.id}?action=restart`])
      } else if (this.status != 1) {
        actions.push(["Start", `/api/app/${this.id}?action=start`],["Update", `/api/app/${this.id}?action=update`])
      }
      return actions
    },
  },
  computed: {
    statusText() {
      switch (this.status) {
        case 2:
          return "Crashed";
        case 1:
          return "Online";
        default:
          return "Offline";
      }
    },
    statusClass() {
      switch (this.status) {
        case 2:
          return "status crashed";
        case 1:
          return "status online";
        default:
          return "status offline";
      }
    },
    sinceMessage() {
      const d = new Date(this.last_changed)
      const MM = d.getMonth() + 1
      const DD = d.getDate()
      const YYYY = d.getFullYear()
      var hh = d.getHours();
      var m = d.getMinutes();
      var dd = "AM";
      var h = hh;
      if (h >= 12) {
        h = hh - 12;
        dd = "PM";
      }
      if (h == 0) {
        h = 12;
      }
      m = m < 10 ? "0" + m : m;

      return "Since " + h + ":" + m + " " + dd + " " + MM + "/" + DD + "/" + YYYY
    },
  },
  data() {
    return {};
  },
  created() {},
};
</script>

<style scoped>
tr {
  border-bottom: solid;
  border-width: 0.15rem 0;
  border-color: var(--light_color);
}

tr>td {
  padding: 0.5rem 0.2rem;
}

td:first-child {
  padding-left: 1.5rem;
}

.status {
  font-size: 0.8rem;
  vertical-align: middle;
}

.status.crashed {
  color: var(--red);
}

.status.online {
  color: var(--green);
}

.status.offline {
  color: var(--light_text);
}

.bold {
  font-weight: 600;
}

.dark {
  color: var(--dark_text);
}

.discrete {
  color: var(--light_text);
  font-style: italic;
}

.small {
  font-size: 0.8rem;
}

@media only screen and (max-width: 575px) and (orientation: portrait) {
  .small {
    display: none;
  }
}
</style>
