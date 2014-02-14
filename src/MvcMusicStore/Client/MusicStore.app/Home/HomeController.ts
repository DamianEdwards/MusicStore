/// <reference path="Home.ts" />

module MusicStore.Home {
    interface IHomeViewModel {
        albums: Array<Models.IAlbum>
    }

    class HomeController implements IHomeViewModel {
        public albums: Array<Models.IAlbum>;

        constructor(albumApi: AlbumApi.IAlbumApiService) {
            var viewModel = this;

            albumApi.getMostPopularAlbums().success(albums => {
                viewModel.albums = albums;
            });
        }
    }

    // TODO: Generate this
    _module.controller("MusicStore.Home.HomeController", [
        "MusicStore.AlbumApi.IAlbumApiService",
        HomeController
    ]);
} 