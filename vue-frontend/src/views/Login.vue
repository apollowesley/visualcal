<template>
  <v-container fluid fill-height class="grey">
    <v-row>
      <v-col>
        <v-form>
          <v-row>
            <v-col>
              <h1 class="text-center">Login to VisualCal</h1>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col>
              <v-text-field
                v-model="fUsername"
                :rules="[ passwordRules.required, passwordRules.email ]"
                autofocus
                class="pa-15"
                label="Username"
                hint="Email address (Use demo@indysoft.com for now)"
                persistent-hint
              />
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col>
              <v-text-field
                v-model="fPassword"
                :append-icon="fPasswordVisible ? 'mdi-eye' : 'mdi-eye-off'"
                :type="fPasswordVisible ? 'text' : 'password'"
                :rules="[ passwordRules.required, passwordRules.min ]"
                class="pa-15"
                label="Password"
                hint="Enter any password of at least 8 characters.  Passwords are not checked currently."
                persistent-hint
                @click:append="fPasswordVisible = !fPasswordVisible"
              />
            </v-col>
          </v-row>
          <v-row class="text-center" no-gutters>
            <v-col>
              <v-btn
                :disabled="fIsLoginButtonDisabled"
                type="submit"
                @click.prevent="onLoginButtonClicked"
              >Login</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { passwordRules as vuetifyPasswordRules } from "@/utils/vuetify-input-rules";
import { LoginCredentials } from "visualcal-common/types/user";
import { isValidEmailAddress } from '../utils/validation';

@Component
export default class LoginView extends Vue {

  fPasswordVisible = false;
  fIsLoginButtonDisabled = true;
  fUsername = "";
  fPassword = "";

  get passwordRules() {
    return vuetifyPasswordRules;
  }

  @Watch("fUsername")
  private onUsernameChanged() {
    this.updateIsLoginButtonDisabled();
  }

  @Watch("fPassword")
  private onPasswordChanged() {
    this.updateIsLoginButtonDisabled();
  }

  private updateIsLoginButtonDisabled() {
    this.fIsLoginButtonDisabled =
      this.fUsername.length <= 0 || !isValidEmailAddress(this.fUsername) || this.fPassword.length <= 0;
  }

  async onLoginButtonClicked() {
    this.fIsLoginButtonDisabled = true;
    const creds: LoginCredentials = {
      username: this.fUsername,
      password: this.fPassword,
    };
    try {
      await this.$store.direct.dispatch.login(creds);
    } catch (error) {
      this.fIsLoginButtonDisabled = false;
      console.info(this.fIsLoginButtonDisabled);
    }
    this.fIsLoginButtonDisabled = false;
  }
}
</script>

<style>
::-webkit-scrollbar {
  display: none;
}
</style>
