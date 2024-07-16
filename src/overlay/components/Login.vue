<template>
  <div class="user-form">
    <img class="mb-4 saltynote-logo" :src="iconUrl" alt="" width="72" height="72" />
    <h1 class="h3 mb-3 font-weight-normal">Please Login</h1>

    <div class="form-group">
      <input type="email" class="form-control" v-model="user.email" placeholder="Your Email" aria-describedby="emailHelp" />
      <small id="emailHelp" class="form-text text-muted text-left">We'll never share your email with anyone else.</small>
    </div>

    <div class="form-group input-group">
      <input type="text" class="form-control" v-model="user.token" placeholder="Verification Code" />
      <div class="input-group-append">
        <button class="btn btn-outline-primary" type="button" @click="sendCode">Send Code</button>
      </div>
    </div>

    <button class="btn btn-lg btn-primary btn-block" @click="signIn">SignIn</button>
  </div>
</template>

<script>
import * as BaseUtils from '../../utils/base';
import toastr from 'toastr';
import * as types from '../../utils/action-types';
import 'toastr/build/toastr.min.css';

export default {
  name: 'Login',
  data() {
    return {
      user: {
        email: '',
        token: '',
      },
      iconUrl: chrome.runtime.getURL('icons/icon.png'),
    };
  },
  created() {
    toastr.options.progressBar = true;
  },
  methods: {
    sendCode() {
      if (!BaseUtils.isEmail(this.user.email)) {
        toastr.error('Email is not valid', 'SaltyNote');
      }

      toastr.info('Processing, please wait...');

      chrome.runtime.sendMessage({ action: types.VERIFY_EMAIL, email: this.user.email }, response => {
        if (!response.done) {
          toastr.error('Sending code failed. Please try again later');
        } else {
          toastr.success('Verification code is sent to your email.');
        }
        return true;
      });
    },
    signIn() {
      if (!BaseUtils.isEmail(this.user.email)) {
        toastr.error('Email is not valid', 'SaltyNote');
        return;
      }
      if (!this.user.token) {
        toastr.error('Email verification code is required', 'SaltyNote');
        return;
      }
      chrome.runtime.sendMessage({ action: types.LOGIN, user: this.user }, response => {
        if (!response.done) {
          toastr.error('SignIn failed. Please try again later');
        }
        return true;
      });
    },
  },
};
</script>

<style scoped lang="scss">
.user-form {
  width: 100%;
  max-width: 330px;
  padding: 15px;
  margin: auto;
  text-align: center;

  img.saltynote-logo {
    margin: auto;
  }

  .form-control {
    position: relative;
    box-sizing: border-box;
    height: auto;
    padding: 10px;
    font-size: 16px;
  }

  p {
    color: #454343;
  }

  .link-mouse {
    cursor: pointer;
    text-decoration: none;
  }
}
</style>
