/// <reference path="Catalog.ts" />

module MusicStore.Store.Catalog {
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
    _module.controller("MusicStore.Store.Catalog.GenreListController", [
        "MusicStore.GenreApi.IGenreApiService",
        GenreListController
    ]);
} 