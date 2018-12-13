//プラグイン/モジュールなど ---------------------------------------------------------
import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';

//HEARTIS関数 -----------------------------------------------------------------------
import { Global } from '../../../inc/Global';
import { IsDispOperation } from '../../../inc/IsDispOperation';
import { IsIniOperation } from '../../../inc/IsIniOperation';

//共通ページ ------------------------------------------------------------------------

//個別ページ ------------------------------------------------------------------------
import { NyukoPage } from '../../private/nyuko/nyuko';
import { SyukoPage } from '../../private/syuko/syuko';
import { MessagePage } from '../../private/message/message';
import { BuggageStatusPage } from '../../private/buggage_status/buggage_status';
import { C_Fujitsu } from '../../../inc/C_Fujitsu';

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    //メニュー一覧
    MENUINFO =
        [
            {
                menu: "SYUKA",
                DispTitle: "集荷",
                icon: "cart"
            },
            {
                menu: "BUGGAGE_STATUS",
                DispTitle: "貨物状態",
                icon: "camera"
            },
            {
                menu: "MESSAGE",
                DispTitle: "メッセージ",
                icon: "mail"
            },
            {
                menu: "HISTORY",
                DispTitle: "送信履歴",
                icon: "time"
            },
            {
                menu: "LOGOFF",
                DispTitle: "ログオフ",
                icon: "power"
            },
            //20181210 ANHLD ADD START
            {
                menu: "PRINT",
                DispTitle: "プリンタテスト",
                icon: "print"
            }
            //20181210 ANHLD ADD END
        ]

    private loginUser: string = "";
    private loginPassword: string = "";

    //20181203 ANHLD DELETE START
    // /*constructor(
    //     public alertCtrl: AlertController,
    //     public navCtrl: NavController,
    //     private backgroundGeolocation: BackgroundGeolocation,
    //     private locationAccuracy: LocationAccuracy) {

    // }*/
    // constructor(
    //     public alertCtrl: AlertController,
    //     public navCtrl: NavController,
    //     private backgroundGeolocation: BackgroundGeolocation,
    //     private locationAccuracy: LocationAccuracy) { //20181121 ANHLD EDIT (Add bluetoothSerial) //20181126 ANHLD EDIT
    // }


    // ionViewWillEnter() {

    //     this.fnc_CheckLocationState().then(() => {
    //         //Get location infomation
    //         this.detectLocationInfo();
    //     });
    // }

    // ionViewWillLeave() {
    //     // start recording location
    //     this.backgroundGeolocation.stop();
    // }
    //20181203 ANHLD DELETE END

    //20181203 ANHLD ADD START
    constructor(
        public alertCtrl: AlertController,
        public navCtrl: NavController,
        private bluetoothSerial: BluetoothSerial) {
    }
    //20181203 ANHLD ADD END

    //メニューを開く
    async openPage(val: String) {
        switch (val) {
            case "NYUKO":
                this.loginUser = await IsIniOperation.IsIniRead(Global.T_SETINI, 'LOGIN_USER');
                this.loginPassword = await IsIniOperation.IsIniRead(Global.T_SETINI, 'PASSWORD');

                //ログインをしているかどうか確認する
                if (this.loginUser == "" || this.loginPassword == "") {
                    await IsDispOperation.IsMessageBox(this.alertCtrl, "ログイン情報が登録されていません", "エラー", "OK", "");
                    return;
                }

                Global.g_Tanto = this.loginUser;
                this.navCtrl.push(NyukoPage, { index: val });
                break;

            case "SYUKO":
                this.loginUser = await IsIniOperation.IsIniRead(Global.T_SETINI, 'LOGIN_USER');
                this.loginPassword = await IsIniOperation.IsIniRead(Global.T_SETINI, 'PASSWORD');

                //ログインをしているかどうか確認する
                if (this.loginUser == "" || this.loginPassword == "") {
                    await IsDispOperation.IsMessageBox(this.alertCtrl, "ログイン情報が登録されていません", "エラー", "OK", "");
                    return;
                }

                Global.g_Tanto = this.loginUser;
                this.navCtrl.push(SyukoPage, { index: val });
                break;


            //貨物状態送信
            case "BUGGAGE_STATUS":
                /*
                this.loginUser = await IsIniOperation.IsIniRead(Global.T_SETINI, 'LOGIN_USER');
                this.loginPassword = await IsIniOperation.IsIniRead(Global.T_SETINI, 'PASSWORD');

                //ログインをしているかどうか確認する
                if (this.loginUser == "" || this.loginPassword == "") {
                    await IsDispOperation.IsMessageBox(this.alertCtrl, "ログインされていません", "エラー", "OK", "");
                    return;
                }
                */

                this.navCtrl.push(BuggageStatusPage, { index: val });
                break;


            //メッセージ
            case "MESSAGE":
                /*
                this.loginUser = await IsIniOperation.IsIniRead(Global.T_SETINI, 'LOGIN_USER');
                this.loginPassword = await IsIniOperation.IsIniRead(Global.T_SETINI, 'PASSWORD');

                //ログインをしているかどうか確認する
                if (this.loginUser == "" || this.loginPassword == "") {
                    await IsDispOperation.IsMessageBox(this.alertCtrl, "ログインされていません", "エラー", "OK", "");
                    return;
                }
                */

                this.navCtrl.push(MessagePage, { index: val });
                break;

            //ログオフ
            case "LOGOFF":
                Global.g_Tanto = "";

                await IsIniOperation.IsIniWrite(Global.T_SETINI, 'LOGIN_USER', '')
                    .then(() => {
                        IsIniOperation.IsIniWrite(Global.T_SETINI, 'PASSWORD', '');
                    })
                    .then(() => {
                        IsIniOperation.IsIniWrite(Global.T_SETINI, 'CARNO', '');
                    });

                let alert = this.alertCtrl.create({
                    title: 'お疲れ様でした。',
                    subTitle: 'ログオフしました',
                    buttons: ['OK']
                });
                alert.present();
                break;

            //20181210 ANHLD ADD START
            case "PRINT":

                var strBdAddress = "";
                var strBDAddressTemp = "";

                strBDAddressTemp = await IsIniOperation.IsIniRead(Global.T_SETINI, 'BDADDRESS');

                //Check BDAddress
                if (strBDAddressTemp == "" || strBDAddressTemp.length != 12) return;

                //Generate Bluetooth mac address
                strBdAddress += strBDAddressTemp.substr(0, 2) + ":";
                strBdAddress += strBDAddressTemp.substr(2, 2) + ":";
                strBdAddress += strBDAddressTemp.substr(4, 2) + ":";
                strBdAddress += strBDAddressTemp.substr(6, 2) + ":";
                strBdAddress += strBDAddressTemp.substr(8, 2) + ":";
                strBdAddress += strBDAddressTemp.substr(10, 2);

                //Connect to device
                this.bluetoothSerial.connect(strBdAddress).subscribe(
                    () => {
                        //Create file------------------------------------↓
                        C_Fujitsu.MakeCommandFile("A334_TEST.TXT").then(
                            () => {
                                //Send data------------------------------------↓
                                C_Fujitsu.prnSendDataSPP("A334_TEST.TXT").then(
                                    () => {
        
                                        //Successs
                                        IsDispOperation.IsMessageBox(this.alertCtrl, "Send Complete", "", "OK", "");
                                    },
                                    (error) => {
                                        console.log("prnSendDataSPP ERROR:" + error);
                                    }
                                );
                                //Send data------------------------------------↑
                            },
                            (error) => {
                                console.log("MakeCommandFile ERROR:" + error);
                            }
                        );
                        //Create file------------------------------------↑
                    },
                    error => {
                        console.log(JSON.stringify(error)); //Unabled to connect to device
                    }
                );

                break;
            //20181210 ANHLD ADD END
        }
    }

    //20181203 ANHLD DELETE START
    // //Get location infomation
    // detectLocationInfo() {
    //     const config: BackgroundGeolocationConfig = {
    //         desiredAccuracy: 0,
    //         stationaryRadius: 0,
    //         distanceFilter: 0,
    //         debug: true, //  enable this hear sounds for background-geolocation life-cycle.
    //         stopOnTerminate: false, // enable this to clear background location settings when the app terminates
    //         interval: 10000 //ANHLD_TEMP //The minimum time interval between location updates in milliseconds
    //     };

    //     this.backgroundGeolocation.configure(config)
    //         .subscribe((location: BackgroundGeolocationResponse) => {

    //             console.log('=>' + new Date().toTimeString() + ":" + location.latitude + ',' + location.longitude);
    //             //alert(new Date().toTimeString() + ":" + location.latitude + ',' + location.longitude); //20181203 ANHLD DELETE

    //             // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
    //             // and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
    //             // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
    //             this.backgroundGeolocation.finish(); // FOR IOS ONLY
    //         });

    //     // start recording location
    //     this.backgroundGeolocation.start();
    // }

    // //Check Location Turn On/Off
    // fnc_CheckLocationState(): Promise<any> {
    //     let promise = new Promise((resolve) => {
    //         this.backgroundGeolocation.isLocationEnabled().then(
    //             (isEnabled) => {
    //                 //Turn Off
    //                 if (isEnabled == 0) {
    //                     //this.diagnostic.switchToLocationSettings();
    //                     this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_BALANCED_POWER_ACCURACY).then(
    //                         () => {
    //                             console.log('Request successful:');
    //                             resolve(true);
    //                         },
    //                         error => {
    //                             console.log('Error requesting location permissions:', error);
    //                             resolve(false);
    //                         });
    //                 }
    //                 else {
    //                     resolve(true);
    //                 }
    //             }, (error) => {
    //                 console.log('Error isLocationEnabled:', error);
    //                 resolve(false);
    //             });
    //     });

    //     return promise;
    // }
    //20181203 ANHLD DELETE END
}
