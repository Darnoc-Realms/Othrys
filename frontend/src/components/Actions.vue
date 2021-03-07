<template>
  <div class="cell">
    <button
      class="toggle"
      v-bind:class="{ active: popupOut }"
      @click="togglePopup"
      v-click-outside="hide"
    >
      <span class="label">Actions</span>
      <svg
        viewBox="0 0 676 355"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        xml:space="preserve"
        xmlns:serif="http://www.serif.com/"
        style="
          fill-rule: evenodd;
          clip-rule: evenodd;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-miterlimit: 1.5;
        "
      >
        <g transform="matrix(1,0,0,1,-60.3349,-117.121)">
          <g transform="matrix(0.673414,0,0,0.673414,31.3939,74.6986)">
            <circle
              cx="306.31"
              cy="326.33"
              r="241.059"
              style="fill: none; stroke-width: 44.55px"
              class="path"
            />
          </g>
          <g transform="matrix(1.0721,0,0,1.0721,-46.8141,-47.071)">
            <circle cx="188.047" cy="318.558" r="24.104" class="dot" />
          </g>
          <g transform="matrix(1.0721,0,0,1.0721,36.0629,-47.071)">
            <circle cx="188.047" cy="318.558" r="24.104" class="dot" />
          </g>
          <g transform="matrix(1.0721,0,0,1.0721,118.94,-47.071)">
            <circle cx="188.047" cy="318.558" r="24.104" class="dot" />
          </g>
          <g
            transform="matrix(1.0976,0,0,1.0976,-62.8428,-25.0384)"
            class="dot"
          >
            <path
              d="M587.452,268.612L650.863,332.023L714.437,268.449"
              style="fill: none; stroke-width: 27.33px"
              class="path"
            />
          </g>
        </g>
      </svg>
    </button>
    <div class="popup" v-if="popupOut">
      <button
        v-for="option in options"
        :key="option[0]"
        @click="submit(option[0], option[1])"
      >
        {{ option[0] }}
      </button>
    </div>
  </div>
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
  props: {
    options: {
      type: Array,
      required: true,
    },
    appName: {
      type: String,
      required: true,
    },
    appId: {
      type: String,
      required: true,
    },
  },
  methods: {
    submit(name, action) {
      console.log(action);
      this.popupOut = false;
      this.$notify({
        title: name + " " + this.appName,
        text: "Success",
        type: "success",
      });
    },
    togglePopup() {
      this.popupOut = !this.popupOut;
    },
    hide() {
      this.popupOut = false;
    },
  },
  data() {
    return {
      popupOut: false,
    };
  },
  directives: {
    ClickOutside,
  },
};
</script>

<style scoped>
.cell {
  float: right;
  padding-right: 1.5rem;
}

button {
  cursor: pointer;
}

button.toggle {
  background: none;
  border: none;
  padding: 0.3rem 0.5rem;
  border-radius: 0.4rem;
  color: inherit;
}

button.toggle:hover {
  background-color: var(--light_color);
  color: var(--hover_text);
}

button.toggle.active {
  background-color: var(--medium_color);
  color: var(--hover_text);
}

div.popup {
  position: absolute;
  display: flex;
  flex-direction: column;
  background-color: rgba(202, 202, 202, 0.966);
  width: 6rem;
  margin-top: 0.5rem;
  padding: 0.3rem;
  border-radius: 0.5rem;
  z-index: 10;
}

.popup > button {
  border: none;
  background: none;
  text-align: left;
  width: auto;
  border-radius: 0.3rem;
  padding: 0.2rem 0.4rem;
}

.popup > button:hover {
  background-color: var(--blue);
  color: white;
}

svg {
  display: inline-block;
  height: 1.1rem;
  vertical-align: middle;
  margin-left: 0.5rem;
  transform: translateY(-0.16rem);
}

.path {
  stroke: var(--medium_text);
}

.dot {
  fill: var(--medium_text);
}

button.toggle:hover > svg > * > * > .path {
  stroke: var(--dark_text);
}

button.toggle:hover > svg > * > * > .dot {
  fill: var(--dark_text);
}

button.toggle.active > svg > * > * > .path {
  stroke: var(--hover_text);
}

button.toggle.active > svg > * > * > .dot {
  fill: var(--hover_text);
}

@media only screen and (max-width: 575px) and (orientation: portrait) {
  .label {
    display: none;
  }
}
</style>