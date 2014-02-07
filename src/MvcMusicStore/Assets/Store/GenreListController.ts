/// <reference path="_module.ts" />

module MusicStore.Store {
    class GenreListController implements IGenreListViewModel {
        public genres: Array<Models.IGenre>;

        constructor($http: ng.IHttpService) {
            var viewModel = this;

            $http.get("/api/genres").success(function (result) {
                viewModel.genres = result;
            });
        }
    }

    // TODO: Generate this
    _module.controller("MusicStore.Store.GenreListController", ["$http", GenreListController]);
} 