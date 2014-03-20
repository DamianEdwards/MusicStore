/// <reference path="Catalog.ts" />

module MusicStore.Admin.Catalog {
    interface IAlbumDetailsRouteParams extends ng.route.IRouteParamsService {
        albumId: number;
    }

    interface IAlbumDetailsViewModel {
        album: Models.IAlbum;
        deleteAlbum();
    }

    class AlbumDetailsController implements IAlbumDetailsViewModel {
        private _modal: ng.ui.bootstrap.IModalService;
        private _location: ng.ILocationService;
        private _albumApi: AlbumApi.IAlbumApiService;
        
        constructor($routeParams: IAlbumDetailsRouteParams,
                    $modal: ng.ui.bootstrap.IModalService,
                    $location: ng.ILocationService,
                    albumApi: AlbumApi.IAlbumApiService) {

            this._modal = $modal;
            this._location = $location;
            this._albumApi = albumApi;

            albumApi.getAlbumDetails($routeParams.albumId).then(album => this.album = album);
        }

        public album: Models.IAlbum;

        public deleteAlbum() {
            var deleteModal = this._modal.open({
                templateUrl: "ng-apps/MusicStore.Admin/Catalog/AlbumDeleteModal.cshtml",
                controller: "MusicStore.Admin.Catalog.AlbumDeleteModalController as viewModel",
                resolve: {
                    album: () => this.album
                }
            });

            deleteModal.result.then(result => {
                if (!result) {
                    return;
                }

                this._albumApi.deleteAlbum(this.album.AlbumId).then(result => {
                    // Navigate back to the list
                    // TODO: How do we pass a message to show?

                    this._location.path("/albums").replace();
                });
            });
        }
    }
    
    // TODO: Generate this
    _module.controller("MusicStore.Admin.Catalog.AlbumDetailsController", [
        "$routeParams",
        "$modal",
        "$location",
        "MusicStore.AlbumApi.IAlbumApiService",
        AlbumDetailsController
    ]);
}