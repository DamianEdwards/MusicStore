/// <reference path="_module.ts" />

module MusicStore.Store {
    class GenreMenuController implements IGenreMenuViewModel {
        public genres: Array<Models.IGenre>;

        constructor($http: ng.IHttpService) {
            var viewModel = this;

            $http.get("/api/genres/menu").success(result => {
                viewModel.genres = result;
            });
        }
    }

    // TODO: Generate this
    _module.controller("MusicStore.Store.GenreMenuController", ["$http", GenreMenuController]);
}