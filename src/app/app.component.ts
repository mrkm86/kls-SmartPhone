import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, ViewController } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { TabsPage } from '../pages/public/tabs/tabs';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { IsIniOperation } from '../inc/IsIniOperation';    //20180918 ANHLD ADD
//20181203 ANHLD ADD START
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
//20181203 ANHLD ADD END

import { HomePage } from '../pages/public/home/home';
import { SettingPage } from '../pages/public/setting/setting';

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    rootPage = TabsPage;

    @ViewChild(Nav) nav: Nav;
    pages: Array<{ title: string, component: any, id: any }>;

    constructor(
        platform: Platform,
        androidPermissions: AndroidPermissions,
        private backgroundGeolocation: BackgroundGeolocation,
        private locationAccuracy: LocationAccuracy) {
        platform.ready().then(() => {

            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.styleDefault();
            Splashscreen.hide();
            androidPermissions.requestPermissions([androidPermissions.PERMISSION.CAMERA, androidPermissions.PERMISSION.GET_ACCOUNTS]);

            //Init database
            IsIniOperation.CreateIniFile();

            //20181203 ANHLD ADD START
            //Call detect location
            this.fnc_CheckLocationState().then(() => {
                //Get location infomation
                this.detectLocationInfo();
            });
            //20181203 ANHLD ADD END

            // used for an example of ngFor and navigation
            this.pages = [
                { title: 'ホーム', component: HomePage, id: 1 },
                { title: '設定', component: SettingPage, id: 2 }
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

    //Get location infomation
    detectLocationInfo() {
        const config: BackgroundGeolocationConfig = {
            desiredAccuracy: 0,
            stationaryRadius: 0,
            distanceFilter: 0,
            debug: true, //  enable this hear sounds for background-geolocation life-cycle.
            stopOnTerminate: false, // enable this to clear background location settings when the app terminates
            interval: 60000 //The minimum time interval between location updates in milliseconds
        };

        this.backgroundGeolocation.configure(config)
            .subscribe((location: BackgroundGeolocationResponse) => {
                
                console.log('=>' + new Date().toTimeString() + ":" + location.latitude + ',' + location.longitude);
                //alert(new Date().toTimeString() + ":" + location.latitude + ',' + location.longitude); //20181203 ANHLD DELETE

                // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
                // and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
                // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
                this.backgroundGeolocation.finish(); // FOR IOS ONLY
            });

        // start recording location
        this.backgroundGeolocation.start();
    }

    //Check Location Turn On/Off
    fnc_CheckLocationState(): Promise<any> {
        let promise = new Promise((resolve) => {
            this.backgroundGeolocation.isLocationEnabled().then(
                (isEnabled) => {
                    //Turn Off
                    if (isEnabled == 0) {
                        //this.diagnostic.switchToLocationSettings();
                        this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_BALANCED_POWER_ACCURACY).then(
                            () => {
                                console.log('Request successful:');
                                resolve(true);
                            },
                            error => {
                                console.log('Error requesting location permissions:', error);
                                resolve(false);
                            });
                    }
                    else {
                        resolve(true);
                    }
                }, (error) => {
                    console.log('Error isLocationEnabled:', error);
                    resolve(false);
                });
        });

        return promise;
    }
    //20181203 ANHLD ADD END
}
