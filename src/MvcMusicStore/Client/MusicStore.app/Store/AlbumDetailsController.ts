/// <reference path="Store.ts" />

module MusicStore.Store {
    interface IAlbumDetailsViewModel {
        album: Models.IAlbum;
    }

    interface IAlbumDetailsRouteParams extends ng.route.IRouteParamsService {
        albumId: number;
    }

    class AlbumDetailsController implements IAlbumDetailsViewModel {
        public album: Models.IAlbum;

        constructor($routeParams: IAlbumDetailsRouteParams, albumApi: AlbumApi.IAlbumApiService) {
            var viewModel = this,
                albumId = $routeParams.albumId;

            albumApi.getAlbumDetails(albumId).success(album => {
                viewModel.album = album;
            });
        }
    }

    // TODO: Generate this
    _module.controller("MusicStore.Store.AlbumDetailsController", [
        "$routeParams",
        "MusicStore.AlbumApi.IAlbumApiService",
        AlbumDetailsController
    ]);
} 