/// <reference path="_module.ts" />

module MusicStore.Home {
    class HomeController implements IHomeViewModel {
        public albums: Array<Models.IAlbum>;

        constructor($http: ng.IHttpService) {
            var viewModel = this;

            $http.get("api/albums/mostPopular").success(result => {
                viewModel.albums = result;
            });
        }
    }

    _module.controller("MusicStore.Home.HomeController", ["$http", HomeController]);
} 