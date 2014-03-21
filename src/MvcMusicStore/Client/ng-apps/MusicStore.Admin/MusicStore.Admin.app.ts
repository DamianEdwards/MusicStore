/// <reference path="../references.ts" />

module MusicStore.Admin {
    class Startup {
        private _routeProvider: ng.route.IRouteProvider;
        private _logProvider;

        constructor(routeProvider: ng.route.IRouteProvider, logProvider) {
            this._routeProvider = routeProvider;
            this._logProvider = logProvider;
        }

        public configuration() {
            // TODO: Enable debug logging based on server config
            // TODO: Capture all logged errors and send back to server
            this._logProvider.debugEnabled(true);

            this._routeProvider
                .when("/albums/:albumId/:mode", { templateUrl: "ng-apps/MusicStore.Admin/Catalog/AlbumEdit.cshtml" })
                .when("/albums/:mode", { templateUrl: "ng-apps/MusicStore.Admin/Catalog/AlbumEdit.cshtml" })
                .when("/albums/:albumId/details", { templateUrl: "ng-apps/MusicStore.Admin/Catalog/AlbumDetails.cshtml" })
                .when("/albums", { templateUrl: "ng-apps/MusicStore.Admin/Catalog/AlbumList.cshtml" })
                .otherwise({ redirectTo: "/albums" });
        }
    }

    // TODO: Generate this!!
    // Register the application module with AngularJS
    var _app = angular.module("MusicStore.Admin", [
        // Dependencies
        "ngRoute",
        "ui.bootstrap",
        "MusicStore.InlineData",
        "MusicStore.GenreMenu",
        "MusicStore.UrlResolver",
        "MusicStore.UserDetails",
        "MusicStore.LoginLink",
        "MusicStore.Visited",
        "MusicStore.TitleCase",
        "MusicStore.Truncate",
        "MusicStore.GenreApi",
        "MusicStore.AlbumApi",
        "MusicStore.ArtistApi",
        "MusicStore.ViewAlert",
        "MusicStore.Admin.Catalog"
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