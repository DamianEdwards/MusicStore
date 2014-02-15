/// <reference path="GenreMenu.ts" />

module MusicStore.GenreMenu {
    interface IGenreMenuViewModel {
        genres: Array<Models.IGenre>;
    }

    class GenreMenuController implements IGenreMenuViewModel {
        public genres: Array<Models.IGenre>;

        constructor(genreApi: GenreApi.IGenreApiService) {
            var viewModel = this;

            genreApi.getGenresMenu().then(genres => {
                viewModel.genres = genres;
            });
        }
    }

    // TODO: Generate this
    _module.controller("MusicStore.GenreMenu.GenreMenuController", [
        "MusicStore.GenreApi.IGenreApiService",
        GenreMenuController
    ]);
}