/// <reference path="../references.ts" />

module MusicStore.Store {
    class Startup {
        private _routeProvider: ng.route.IRouteProvider;
        private _logProvider;

        constructor(routeProvider: ng.route.IRouteProvider, logProvider) {
            this._routeProvider = routeProvider;
            this._logProvider = logProvider;
        }

        public configuration() {
            this._logProvider.debugEnabled(true);

            this._routeProvider
                .when("/", { templateUrl: "ng-apps/MusicStore.Store/Home/Home.html" })
                .when("/albums/genres", { templateUrl: "ng-apps/MusicStore.Store/Catalog/GenreList.html" })
                .when("/albums/genres/:genreId", { templateUrl: "ng-apps/MusicStore.Store/Catalog/GenreDetails.html" })
                .when("/albums/:albumId", { templateUrl: "ng-apps/MusicStore.Store/Catalog/AlbumDetails.html" })
                .otherwise({ redirectTo: "/" });
        }
    }
    
    // TODO: Generate this!!
    // Register the application module with AngularJS
    var _app = angular.module("MusicStore.Store", [
        // Dependencies
        "ngRoute",
        "MusicStore.InlineData",
        "MusicStore.PreventSubmit",
        "MusicStore.GenreMenu",
        "MusicStore.UrlResolver",
        "MusicStore.UserDetails",
        "MusicStore.LoginLink",
        "MusicStore.GenreApi",
        "MusicStore.AlbumApi",
        "MusicStore.Store.Home",
        "MusicStore.Store.Catalog"
    ]);

    _app.config([
        // Dependencies
        "$routeProvider",
        "$logProvider",

        // Config method
        function ($routeProvider, $logProvider) {
            new Startup($routeProvider, $logProvider).configuration();
        }
    ]);
}