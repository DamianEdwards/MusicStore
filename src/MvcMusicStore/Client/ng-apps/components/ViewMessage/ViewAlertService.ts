/// <reference path="ViewAlert.ts" />

module MusicStore.ViewAlert {
    export interface IViewAlertService {
        alert: Models.IAlert;
    }

    class ViewAlertService implements IViewAlertService {
        public alert: Models.IAlert;
    }

    _module.service("MusicStore.ViewAlert.IViewAlertService", [
        ViewAlertService
    ]);
} 