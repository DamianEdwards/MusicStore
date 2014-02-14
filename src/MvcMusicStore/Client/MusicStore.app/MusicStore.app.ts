/// <reference path="../../bower_components/dt-angular/angular-route.d.ts" />
/// <reference path="../../bower_components/dt-angular/angular.d.ts" />

module MusicStore {
    class Startup {
        private _routeProvider: ng.route.IRouteProvider;

        constructor(routeProvider: ng.route.IRouteProvider) {
            this._routeProvider = routeProvider;
        }

        public configuration() {
            this._routeProvider
                .when("/", { templateUrl: "MusicStore.app/Home/index.html" })
                .when("/albums/genres", { templateUrl: "MusicStore.app/Store/GenreList.html" })
                .when("/albums/genres/:genreId", { templateUrl: "MusicStore.app/Store/GenreDetails.html" })
                .when("/albums/:albumId", { templateUrl: "MusicStore.app/Store/AlbumDetails.html" })
                .otherwise({ redirectTo: "/" });
        }
    }

    // TODO: Generate this!!
    // Register the application module with AngularJS
    var _app = angular.module("MusicStore", [
        // Dependencies
        "ngRoute",
        "MusicStore.GenreMenu",
        "MusicStore.UrlResolver",
        "MusicStore.UserDetails",
        "MusicStore.GenreApi",
        "MusicStore.AlbumApi",
        "MusicStore.Home",
        "MusicStore.Store"
    ]);

    _app.config([
        // Dependencies
        "$routeProvider",

        // Config method
        function ($routeProvider) {
            new Startup($routeProvider).configuration();
        }
    ]);
}