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
        private _timeout: ng.ITimeoutService;

        constructor($routeParams: IAlbumDetailsRouteParams, albumApi: AlbumApi.IAlbumApiService, $timeout: ng.ITimeoutService) {
            var viewModel = this,
                albumId = $routeParams.albumId;

            this._albumApi = albumApi;
            this._timeout = $timeout;
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
                    var alert = { type: Models.AlertType.success, message: result.Message };
                    this.alerts.push(alert);
                    this._timeout(() => this.alerts.forEach((value, index) => value !== alert || this.closeAlert(index)), 3000);
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
        "$timeout",
        AlbumEditController
    ]);
} 