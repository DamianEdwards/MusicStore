/// <reference path="Catalog.ts" />

module MusicStore.Admin.Catalog {
    interface IAlbumListViewModel {
        albums: Array<Models.IAlbum>;
        truncate(input: string, length: number): string;
    }

    class AlbumListController implements IAlbumListViewModel {
        constructor(albumApi: AlbumApi.IAlbumApiService) {
            var viewModel = this;

            albumApi.getAlbums().then(albums => viewModel.albums = albums);
        }

        public albums: Array<Models.IAlbum>;

        public truncate(input: string, length: number) {
            if (input.length <= length) {
                return input;
            } else {
                return input.substr(0, length).trim() + "…";
            }
        }
    }
    
    // TODO: Generate this
    _module.controller("MusicStore.Admin.Catalog.AlbumListController", [
        "MusicStore.AlbumApi.IAlbumApiService",
        AlbumListController
    ]);
}