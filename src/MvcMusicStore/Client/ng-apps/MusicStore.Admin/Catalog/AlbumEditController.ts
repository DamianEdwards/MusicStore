/// <reference path="Catalog.ts" />

module MusicStore.Admin.Catalog {
    interface IAlbumDetailsRouteParams extends ng.route.IRouteParamsService {
        albumId: number;
    }

    interface IAlbumDetailsViewModel {
        disabled: boolean;
        album: Models.IAlbum;
        alert: Models.IAlert;
        save();
        clearAlert();
    }

    class AlbumEditController implements IAlbumDetailsViewModel {
        private _albumApi: AlbumApi.IAlbumApiService;
        private _timeout: ng.ITimeoutService;
        private _log: ng.ILogService;

        constructor(
            $routeParams: IAlbumDetailsRouteParams,
            albumApi: AlbumApi.IAlbumApiService,
            $timeout: ng.ITimeoutService,
            $log: ng.ILogService) {

            this._albumApi = albumApi;
            this._timeout = $timeout;
            this._log = $log;

            albumApi.getAlbumDetails($routeParams.albumId).then(album => {
                this.album = album;
                this.disabled = false;
            });
        }

        public disabled = true;

        public album: Models.IAlbum;

        public alert: Models.IAlert;

        public save() {
            this.disabled = true;
            this._albumApi.updateAlbum(this.album).then(
                // Success
                response => {
                    this._log.info("Updated album " + this.album.AlbumId + " successfully!");

                    this.disabled = false;

                    var alert = {
                        type: Models.AlertType.success,
                        message: response.data.Message
                    };

                    this.alert = alert;

                    // TODO: Do we need to destroy this timeout on controller unload?
                    this._timeout(() => this.alert !== alert || this.clearAlert(), 3000);
                },
                // Error
                response => {
                    if (response.status === 400) {
                        // We made a bad request
                        if (response.data && response.data.ModelErrors) {
                            // The server says the update failed validation
                            // TODO: Map errors back to client validators and/or summary
                            this.alert = {
                                type: Models.AlertType.danger,
                                message: response.data.Message,
                                modelErrors: response.data.ModelErrors
                            };
                            this.disabled = false;
                        } else {
                            // Some other bad request, just show the message
                            this.alert = {
                                type: Models.AlertType.danger,
                                message: response.data.Message
                            };
                        }
                    } else if (response.status === 404) {
                        // The album wasn't found, probably deleted
                        this.alert = {
                            type: Models.AlertType.danger,
                            message: response.data.Message
                        };
                    } else if (response.status === 401) {
                        // We need to authenticate again
                        // TODO: Should we just redirect to login page, show a message with a link, or something else
                        this.alert = {
                            type: Models.AlertType.danger,
                            message: "Your session has timed out. Please log in and try again."
                        };
                    } else if (!response.status) {
                        // Request timed out or no response from server or worse
                        this._log.error("Error updating album " + this.album.AlbumId);
                        this._log.error(response);
                        this.alert = { type: Models.AlertType.danger, message: "An unexpected error occurred. Please try again." };
                        this.disabled = false;
                    }
                });
        }

        public clearAlert() {
            this.alert = null;
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