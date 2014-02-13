/// <reference path="Store.ts" />

module MusicStore.Store {
    class GenreDetailsController implements IGenreDetailsViewModel {
        public albums: Array<Models.IAlbum>;

        constructor($http: ng.IHttpService, $routeParams: IGenreDetailsRouteParams, urlResolver: UrlResolver.IUrlResolverService) {
            var viewModel = this,
                url = urlResolver.resolveUrl("~/api/genres/" + $routeParams.genreId + "/albums");

            $http.get(url).success(result => {
                viewModel.albums = result;
            });
        }
    }

    // TODO: Generate this
    _module.controller("MusicStore.Store.GenreDetailsController", [
        "$http",
        "$routeParams",
        "MusicStore.UrlResolver.IUrlResolverService",
        GenreDetailsController]);
}