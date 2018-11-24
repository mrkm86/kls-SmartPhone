import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ViewController } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { TabsPage } from '../pages/public/tabs/tabs';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { IsIniOperation } from '../inc/IsIniOperation';    //20180918 ANHLD ADD

import { HomePage } from '../pages/public/home/home';
import { SettingPage } from '../pages/public/setting/setting';
import { SearchPage } from '../pages/private/search/search';
import { Global } from '../inc/Global';

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage = TabsPage;

    @ViewChild(Nav) nav: Nav;
    pages: Array<{ title: string, component: any, id: any }>;

    constructor(
        platform: Platform,
        androidPermissions: AndroidPermissions) {
        platform.ready().then(() => {

            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.styleDefault();
            Splashscreen.hide();
            androidPermissions.requestPermissions([androidPermissions.PERMISSION.CAMERA, androidPermissions.PERMISSION.GET_ACCOUNTS]);

            //Init database
            IsIniOperation.CreateIniFile();

            // used for an example of ngFor and navigation
            this.pages = [
                { title: 'ホーム', component: HomePage, id: 1 },
                { title: '検索画面', component: SearchPage, id: 2 },
                { title: '設定', component: SettingPage, id: 3 }
            ];
        });
    }

    openPage(page) {
        // Reset the content nav to have just this page
        // we wouldn't want the back button to show in this scenario
        if (page.id !== 1) {
            this.nav.setRoot(page.component);
        } else {
            this.nav.setRoot(TabsPage).then(() => {
            });
        }
    }
}
