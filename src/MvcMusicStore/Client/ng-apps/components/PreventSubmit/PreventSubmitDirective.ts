/// <reference path="PreventSubmit.ts" />

module MusicStore.PreventSubmit {
    interface IPreventSubmitAttributes extends ng.IAttributes {
        name: string;
        appPreventSubmit: string;
    }

    class PreventSubmitDirective implements ng.IDirective {
        private _preventSubmit: any;

        constructor() {
            this.link = this.link.bind(this);
        }

        public restrict = "A";

        public link(scope: any, element: ng.IAugmentedJQuery, attrs: IPreventSubmitAttributes) {
            element.submit(e => {
                if (scope.$eval(attrs.appPreventSubmit)) {
                    e.preventDefault();
                    return false;
                }
            });
        }
    }

    // TODO: Generate this
    _module.directive("appPreventSubmit", [
        function () {
            return new PreventSubmitDirective();
        }
    ]);
}  