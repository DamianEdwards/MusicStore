/// <reference path="GenreMenu.ts" />

module MusicStore.GenreMenu {
    class GenreMenuController implements IGenreMenuViewModel {
        public genres: Array<Models.IGenre>;

        constructor($http: ng.IHttpService, genreApi: GenreApi.IGenreApiService) {
            var viewModel = this;

            genreApi.getGenresMenu().success(genres => {
                viewModel.genres = genres;
            });
        }
    }

    // TODO: Generate this
    _module.controller("MusicStore.GenreMenu.GenreMenuController", [
        "$http",
        "MusicStore.GenreApi.IGenreApiService",
        GenreMenuController]);
}