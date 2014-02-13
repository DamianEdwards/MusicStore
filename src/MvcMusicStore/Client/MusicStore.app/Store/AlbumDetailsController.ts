/// <reference path="Store.ts" />

module MusicStore.Store {
    class AlbumDetailsController implements IAlbumDetailsViewModel {
        public album: Models.IAlbum;

        constructor($http: ng.IHttpService, $routeParams: IAlbumDetailsRouteParams, urlResolver: UrlResolver.IUrlResolverService) {
            var viewModel = this,
                albumId = $routeParams.albumId,
                url = urlResolver.resolveUrl("~/api/albums/" + albumId);

            $http.get(url).success(result => {
                viewModel.album = result;
            });
        }
    }

    // TODO: Generate this
    _module.controller("MusicStore.Store.AlbumDetailsController", [
        "$http",
        "$routeParams",
        "MusicStore.UrlResolver.IUrlResolverService",
        AlbumDetailsController]);
} 