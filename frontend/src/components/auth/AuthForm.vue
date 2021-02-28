<template>
  <div class="page">
    <div class="box login" v-if="!inSetup">
      <header><h1>Login</h1></header>
      <form @submit.prevent="completeLogin" autocomplete="off">
        <div>
          <label> Username </label><br />
          <input
            type="text"
            v-model.lazy.trim="loginUsername"
            placeholder="..."
          />
        </div>
        <div>
          <label> Token </label><br />
          <input
            type="text"
            v-model.lazy.trim="loginToken"
            placeholder="######"
            pattern="[0-9]{6}"
          />
        </div>
        <div class="button_area">
          <button
            type="button"
            class="extra"
            onclick="window.open('https://github.com/Darnoc-Realms/Othrys/wiki/Reset-2FA-Secret')"
          >
            Reset Secret
          </button>
          <button type="submit" class="emphasis">Login</button>
        </div>
      </form>
    </div>
    <div class="box setup" v-if="inSetup">
      <header><h1>Setup</h1></header>
      <form @submit.prevent="completeSetup" autocomplete="off">
        <div>
          <label> Set Username </label><br />
          <input
            type="text"
            v-model.lazy.trim="setUsername"
            placeholder="..."
          />
        </div>
        <div>
          <label> Scan Secret </label><br />
          <p>
            Use an app like Google Authenticator<br />to scan the code below.
          </p>
          <img :src="qrUrl" />
        </div>
        <div class="button_area">
          <button type="submit" class="emphasis">Setup</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    inSetup: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    completeSetup() {
      if (this.setUsername != "") {
        this.axios
          .post("auth/setup", {
            username: this.setUsername,
          })
          .then((response) => {
            if (response.status == 201) {
              this.$notify({
                title: "Completed Setup",
                text: "With username: <b>" + this.setUsername + "</b>",
              });
              this.inSetup = false;
            } else {
              this.$notify({
                title: "Setup Error",
                type: "error",
                text: response.statusText,
              });
            }
          });
      } else {
        this.$notify({
          title: "Missing Fields",
          type: "warn",
          text: "You must choose a username",
        });
      }
    },
    completeLogin() {
      if (this.loginUsername != "" && this.loginToken != "") {
        this.axios
          .post("auth/login", {
            username: this.loginUsername,
            token: this.loginToken,
          })
          .then(() => {
            this.$notify({
              title: "Login Successful",
              text: "As: <b>" + this.loginUsername + "</b>",
            });
            this.$emit("logged_in");
          })
          .catch((error) => {
            this.$notify({
              title: "Login Error",
              type: "error",
              text: error.response.data,
            });
          });
      } else {
        this.$notify({
          title: "Missing Fields",
          type: "warn",
          text: "The username or token is missing",
        });
      }
    },
  },
  computed: {},
  data() {
    return {
      loginUsername: "",
      loginToken: "",
      setUsername: "",
      qrUrl: "",
    };
  },
  beforeCreate() {},
  created() {
    if (this.inSetup) {
      this.getAPI("auth/setup_qr").then((data) => {
        this.qrUrl = data;
      })
    }
  },
};
</script>

<style scoped>
div.page {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

div.box {
  z-index: 50;
  filter: drop-shadow(0 0.2rem 0.5rem rgba(0, 0, 0, 0.2));
}

header {
  text-align: center;
  background-color: rgba(66, 66, 66, 0.9);
  color: white;
  display: block;
}

form {
  background-color: var(--thick_color);
  border-radius: var(--radius_bottom);
  padding: 2rem;
}

form > div {
  margin: 1rem auto;
}

form > div:first-child {
  margin: 0rem auto;
}

p {
  margin: 0;
  color: var(--light_text);
  font-size: 0.8rem;
}

img {
  display: block;
  margin: 2.5rem auto 3.5rem;
  image-rendering: pixelated;
  border-radius: 0.4rem;
  object-fit: none; /* Do not scale the image */
  object-position: top left; /* Center the image within the element */
  height: 165px;
  width: 165px;
  transform: scale(1.3);
}

.button_area {
  margin: 3rem 0 0 0;
  width: 100%;
  display: flex;
  gap: 0.8rem;
}

button {
  flex: 2 1 auto;
  background-color: var(--medium_color);
  padding: 0.3rem 1.2rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  color: inherit;
}

button.extra {
  background: none;
  box-shadow: inset 0 0 0 0.1rem var(--light_text);
  color: var(--medium_text);
  font-size: 0.9rem;
}

button.emphasis {
  background-color: var(--blue);
  color: white;
}

input {
  width: calc(100% - 0.75rem);
  border: 0.1rem solid rgba(0, 0, 0, 0.2);
  border-radius: 0.3rem;
  margin-top: 0.3rem;
  background-color: var(--light_color);
  color: var(--dark_text);
  padding: 0.2rem 0.4rem;
}

input:focus {
  background-color: transparent;
  border: 0.1rem solid rgba(0, 0, 0, 0.4);
}

label {
  color: var(--medium_text);
}

@media only screen and (max-width: 575px) and (orientation: portrait) {
  .small {
    display: none;
  }
}
</style>
