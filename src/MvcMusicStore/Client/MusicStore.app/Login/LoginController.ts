/// <reference path="Login.ts" />

module MusicStore.Login {
    interface ILoginViewModel {
        userName: string;
        password: string;
        rememberMe: boolean;
        submitClicked: boolean;
        submit: () => void;
    }

    class LoginController implements ILoginViewModel {
        constructor() {
            var viewModel = this;

        }

        public userName: string;
        public password: string;
        public rememberMe: boolean;
        public submitClicked = false;

        public submit() {
            this.submitClicked = true;

            return false;
        }
    }

    // TODO: Generate this
    _module.controller("MusicStore.Login.LoginController", [
        LoginController
    ]);
}  