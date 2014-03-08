/// <reference path="Catalog.ts" />

module MusicStore.Admin.Catalog {
    interface IAlbumDetailsRouteParams extends ng.route.IRouteParamsService {
        albumId: number;
    }

    interface IAlbumDetailsViewModel {
        album: Models.IAlbum;
    }

    class AlbumDetailsController implements IAlbumDetailsViewModel {
        constructor(routeParams: IAlbumDetailsRouteParams, albumApi: AlbumApi.IAlbumApiService) {
            var viewModel = this;

            albumApi.getAlbumDetails(routeParams.albumId).then(album => viewModel.album = album);
        }

        public album: Models.IAlbum;
    }
    
    // TODO: Generate this
    _module.controller("MusicStore.Admin.Catalog.AlbumDetailsController", [
        "$routeParams",
        "MusicStore.AlbumApi.IAlbumApiService",
        AlbumDetailsController
    ]);
}