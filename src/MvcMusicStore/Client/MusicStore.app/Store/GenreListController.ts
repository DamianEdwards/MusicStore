/// <reference path="Store.ts" />

module MusicStore.Store {
    class GenreListController implements IGenreListViewModel {
        public genres: Array<Models.IGenre>;

        constructor($http: ng.IHttpService, urlResolver: UrlResolver.IUrlResolverService) {
            var viewModel = this,
                url = urlResolver.resolveUrl("~/api/genres");

            $http.get(url).success(function (result) {
                viewModel.genres = result;
            });
        }
    }

    // TODO: Generate this
    _module.controller("MusicStore.Store.GenreListController", [
        "$http",
        "MusicStore.UrlResolver.IUrlResolverService",
        GenreListController]);
} 