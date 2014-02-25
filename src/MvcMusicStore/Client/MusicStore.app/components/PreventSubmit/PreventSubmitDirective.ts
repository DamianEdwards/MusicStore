/// <reference path="PreventSubmit.ts" />

module MusicStore.PreventSubmit {
    interface IPreventSubmitAttributes extends ng.IAttributes {
        name: string;
        musPreventSubmit: string;
    }

    class PreventSubmitDirective implements ng.IDirective {
        private _preventSubmit: any;

        constructor() {
            this.link = this.link.bind(this);
        }

        public restrict = "A";

        public link(scope: any, element: ng.IAugmentedJQuery, attrs: IPreventSubmitAttributes) {
            element.submit(e => {
                if (scope.$eval(attrs.musPreventSubmit)) {
                    e.preventDefault();
                    return false;
                }
            });
        }
    }

    // TODO: Generate this
    _module.directive("musPreventSubmit", [
        function () {
            return new PreventSubmitDirective();
        }
    ]);
}  