/// <reference path="Catalog.ts" />

module MusicStore.Admin.Catalog {
    interface IAlbumDetailsRouteParams extends ng.route.IRouteParamsService {
        albumId: number;
    }

    interface IAlbumDetailsViewModel {
        disabled: boolean;
        album: Models.IAlbum;
        alerts: Array<Models.IAlert>;
        save();
        closeAlert(index: number);
    }

    class AlbumEditController implements IAlbumDetailsViewModel {
        private _albumApi: AlbumApi.IAlbumApiService;
        private _timeout: ng.ITimeoutService;
        private _log: ng.ILogService;

        constructor($routeParams: IAlbumDetailsRouteParams, albumApi: AlbumApi.IAlbumApiService, $timeout: ng.ITimeoutService, $log: ng.ILogService) {
            this._albumApi = albumApi;
            this._timeout = $timeout;
            this._log = $log;

            this.alerts = [];

            albumApi.getAlbumDetails($routeParams.albumId).then(album => {
                this.album = album;
                this.disabled = false;
            });
        }

        public disabled = true;

        public album: Models.IAlbum;

        public alerts: Array<Models.IAlert>;

        public save() {
            this.disabled = true;
            this._albumApi.updateAlbum(this.album)
                .then(result => {
                    this._log.info("Updated album " + this.album + " successfully!");

                    this.disabled = false;

                    var alert: Models.IAlert = {
                        type: Models.AlertType.success,
                        message: result.data.Message
                    };
                    this.alerts.splice(0);
                    this.alerts.push(alert);
                    // TODO: Do we need to destroy this timeout on controller unload?
                    this._timeout(() => this.alerts.forEach((value, index) => value !== alert || this.closeAlert(index)), 3000);
                }, response => {
                    if (response.status === 400) {
                        // We made a bad request
                        if (response.data && response.data.ModelErrors) {
                            // The server says the update failed validation
                            // TODO: Map errors back to client validators and/or summary
                            var alert: Models.IModelErrorAlert = {
                                type: Models.AlertType.danger,
                                message: response.data.Message,
                                modelErrors: response.data.ModelErrors
                            };
                            this.alerts.push(alert);
                            this.disabled = false;
                        } else {
                            // Some other bad request, just show the message
                            this.alerts.push({ type: Models.AlertType.danger, message: response.data.Message });
                        }
                    } else if (response.status === 404) {
                        // The album wasn't found, probably deleted
                        this.alerts.push({ type: Models.AlertType.danger, message: response.data.Message });
                    } else if (response.status === 401) {
                        // We need to authenticate again
                        // TODO: Should we just redirect to login page, show a message with a link, or something else
                        this.alerts.push({ type: Models.AlertType.danger, message: "Your session has timed out. Please log in and try again." });
                    } else if (!response.status) {
                        // Request timed out or no response from server or worse
                        this._log.error("Error updating album " + this.album.AlbumId);
                        this._log.error(response);
                        this.alerts.push({ type: Models.AlertType.danger, message: "An unexpected error occurred. Please try again." });
                        this.disabled = false;
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
        "$log",
        AlbumEditController
    ]);
} 