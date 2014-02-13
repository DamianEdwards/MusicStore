/// <reference path="_module.ts" />

module MusicStore.UserDetails {
    class UserDetailsService implements IUserDetailsService {
        private _document: ng.IDocumentService;
        private _userDetails: IUserDetails;

        constructor($document: ng.IDocumentService) {
            this._document = $document;
        }

        public getUserDetails(elementId = "userDetails") {
            if (!this._userDetails) {
                var el = this._document.querySelector("#" + elementId);
                
                if (el && el.firstChild && el.firstChild.nodeValue) {
                    this._userDetails = angular.fromJson(el.firstChild.nodeValue);
                } else {
                    this._userDetails = {
                        isAuthenticated: false,
                        userId: null,
                        userName: null,
                        roles: []
                    };
                }
            }
            return this._userDetails;
        }
    }

    // TODO: Generate this!
    _module.service("MusicStore.UserDetails.UserDetailsService", [
        "$document",
        UserDetailsService
    ]);
} 