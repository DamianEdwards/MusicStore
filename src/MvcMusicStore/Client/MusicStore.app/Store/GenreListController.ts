/// <reference path="Store.ts" />

module MusicStore.Store {
    interface IGenreListViewModel {
        genres: Array<Models.IGenre>;
    }

    class GenreListController implements IGenreListViewModel {
        public genres: Array<Models.IGenre>;

        constructor(genreApi: GenreApi.IGenreApiService) {
            var viewModel = this;

            genreApi.getGenresList().success(function (genres) {
                viewModel.genres = genres;
            });
        }
    }

    // TODO: Generate this
    _module.controller("MusicStore.Store.GenreListController", [
        "MusicStore.GenreApi.IGenreApiService",
        GenreListController
    ]);
} 