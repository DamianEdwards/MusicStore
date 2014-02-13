/// <reference path="GenreMenu.ts" />

module MusicStore.GenreMenu {
    class GenreMenuController implements IGenreMenuViewModel {
        public genres: Array<Models.IGenre>;

        constructor($http: ng.IHttpService, urlResolver: UrlResolver.IUrlResolverService) {
            var viewModel = this,
                url = urlResolver.resolveUrl("~/api/genres/menu");

            $http.get(url).success(result => {
                viewModel.genres = result;
            });
        }
    }

    // TODO: Generate this
    _module.controller("MusicStore.GenreMenu.GenreMenuController", [
        "$http",
        "MusicStore.UrlResolver.IUrlResolverService",
        GenreMenuController]);
}