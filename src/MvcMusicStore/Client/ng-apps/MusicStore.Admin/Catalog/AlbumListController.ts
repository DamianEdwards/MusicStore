/// <reference path="Catalog.ts" />

module MusicStore.Admin.Catalog {
    interface IAlbumListViewModel {
        albums: Array<Models.IAlbum>;
        totalCount: number;
        currentPage: number;
        pageSize: number;
        loadPage(page: number);
        truncate(input: string, length: number): string;
    }

    class AlbumListController implements IAlbumListViewModel {
        private _albumApi: AlbumApi.IAlbumApiService;

        constructor(albumApi: AlbumApi.IAlbumApiService) {
            this._albumApi = albumApi;
            this.currentPage = 1;
            this.pageSize = 50;
            this.loadPage(1);
        }

        public albums: Array<Models.IAlbum>;

        public totalCount: number;

        public currentPage: number;

        public pageSize: number;

        public loadPage(page: number) {
            this._albumApi.getAlbums(page, this.pageSize).then(result => {
                this.albums = result.Data;
                this.currentPage = result.Page;
                this.totalCount = result.TotalCount;
            });
        }

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