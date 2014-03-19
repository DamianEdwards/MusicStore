/// <reference path="Catalog.ts" />

module MusicStore.Admin.Catalog {
    interface IAlbumListViewModel {
        albums: Array<Models.IAlbum>;
        totalCount: number;
        currentPage: number;
        pageSize: number;
        loadPage(page?: number);
        deleteAlbum(album: Models.IAlbum);
        clearAlert();
        truncate(input: string, length: number): string;
    }

    class AlbumListController implements IAlbumListViewModel {
        private _albumApi: AlbumApi.IAlbumApiService;
        private _modal: ng.ui.bootstrap.IModalService;
        private _timeout: ng.ITimeoutService;
        private _log: ng.ILogService;

        constructor(albumApi: AlbumApi.IAlbumApiService,
                    $modal: ng.ui.bootstrap.IModalService,
                    $timeout: ng.ITimeoutService,
                    $log: ng.ILogService) {

            this._albumApi = albumApi;
            this._modal = $modal;
            this._timeout = $timeout;
            this._log = $log;

            this.currentPage = 1;
            this.pageSize = 50;
            this.loadPage(1);
            this.sortColumn = "Title";
        }

        public alert: Models.IAlert;

        public albums: Array<Models.IAlbum>;

        public totalCount: number;

        public currentPage: number;

        public pageSize: number;

        public sortColumn: string;

        public sortDescending: boolean;

        public loadPage(page?: number) {
            page = page || this.currentPage;
            var sortByExpression = this.getSortByExpression();
            this._albumApi.getAlbums(page, this.pageSize, sortByExpression).then(result => {
                this.albums = result.Data;
                this.currentPage = result.Page;
                this.totalCount = result.TotalCount;
            });
        }

        public sortBy(column: string) {
            if (this.sortColumn === column) {
                // Just flip the direction
                this.sortDescending = !this.sortDescending;
            } else {
                this.sortColumn = column;
                this.sortDescending = false;
            }

            this.loadPage();
        }

        public deleteAlbum(album: Models.IAlbum) {
            var deleteModal = this._modal.open({
                templateUrl: "ng-apps/MusicStore.Admin/Catalog/AlbumDeleteModal.cshtml",
                controller: "MusicStore.Admin.Catalog.AlbumDeleteModalController as viewModel",
                resolve: {
                    album: () => album
                }
            });

            deleteModal.result.then(result => {
                if (!result) {
                    return;
                }

                this._albumApi.deleteAlbum(album.AlbumId).then(result => {
                    this.loadPage();

                    var alert = {
                        type: Models.AlertType.success,
                        message: result.data.Message
                    };

                    this.alert = alert;

                    // TODO: Do we need to destroy this timeout on controller unload?
                    this._timeout(() => this.alert !== alert || this.clearAlert(), 3000);
                });
            });
        }

        public clearAlert() {
            this.alert = null;
        }

        public truncate(input: string, length: number) {
            if (input.length <= length) {
                return input;
            } else {
                return input.substr(0, length).trim() + "…";
            }
        }

        private getSortByExpression() {
            if (this.sortDescending) {
                return this.sortColumn + " DESC";
            }
            return this.sortColumn;
        }
    }

    // TODO: Generate this
    _module.controller("MusicStore.Admin.Catalog.AlbumListController", [
        "MusicStore.AlbumApi.IAlbumApiService",
        "$modal",
        "$timeout",
        "$log",
        AlbumListController
    ]);
}