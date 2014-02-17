/// <reference path="GenreMenu.ts" />

module MusicStore.GenreMenu {
    class GenreMenuDirective implements ng.IDirective {
        public replace = true;
        public restrict = "A";
        public templateUrl;

        constructor(urlResolver: UrlResolver.IUrlResolverService) {
            this.templateUrl = urlResolver.resolveUrl("~/MusicStore.app/components/GenreMenu/GenreMenu.html");
        }
    }

    // TODO: Generate this
    _module.directive("musGenreMenu", [
        "MusicStore.UrlResolver.IUrlResolverService",
        function (urlResolver) {
            return new GenreMenuDirective(urlResolver);
        }
    ]);
}