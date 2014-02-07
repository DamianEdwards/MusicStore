/// <reference path="_module.ts" />

module MusicStore.Store {
    class AlbumDetailsController implements IAlbumDetailsViewModel {
        public album: Models.IAlbum;

        constructor($http: ng.IHttpService, $routeParams: IAlbumDetailsRouteParams) {
            var viewModel = this,
                albumId = $routeParams.albumId;

            $http.get("/api/albums/" + albumId).success(result => {
                viewModel.album = result;
            });
        }
    }

    _module.controller("MusicStore.Store.AlbumDetailsController", [
        "$http",
        "$routeParams",
        AlbumDetailsController]);
} 