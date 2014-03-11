/// <reference path="Catalog.ts" />

module MusicStore.Admin.Catalog {
    interface IAlbumDetailsRouteParams extends ng.route.IRouteParamsService {
        albumId: number;
    }

    interface IAlbumDetailsViewModel {
        album: Models.IAlbum;
        alerts: Array<Models.IAlert>;
        save();
        closeAlert(index: number);
    }

    class AlbumEditController implements IAlbumDetailsViewModel {
        private _albumApi: AlbumApi.IAlbumApiService;

        constructor($routeParams: IAlbumDetailsRouteParams, albumApi: AlbumApi.IAlbumApiService) {
            var viewModel = this,
                albumId = $routeParams.albumId;

            this._albumApi = albumApi;
            this.alerts = [];

            albumApi.getAlbumDetails(albumId).then(album => {
                viewModel.album = album;
            });
        }

        public album: Models.IAlbum;

        public alerts: Array<Models.IAlert>;

        public save() {
            this._albumApi.updateAlbum(this.album).then(result => {
                if (!result.ModelErrors) {
                    this.alerts.push({ type: Models.AlertType.success, message: result.Message });
                } else {
                    // TODO: Map errors back to client validators or summary

                }
            });
        }

        public closeAlert(index: number) {
            this.alerts.splice(index, 1);
        }
    }

    // TODO: Generate this
    _module.controller("MusicStore.Admin.Catalog.AlbumEditController", [
        "$routeParams",
        "MusicStore.AlbumApi.IAlbumApiService",
        AlbumEditController
    ]);
} 