//プラグイン/モジュールなど ---------------------------------------------------------
import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';

//HEARTIS関数 -----------------------------------------------------------------------
import { Global } from '../../../inc/Global';
import { IsDispOperation } from '../../../inc/IsDispOperation';
import { IsIniOperation } from '../../../inc/IsIniOperation';

//共通ページ ------------------------------------------------------------------------

//個別ページ ------------------------------------------------------------------------
import { NyukoPage } from '../../private/nyuko/nyuko';
import { SyukoPage } from '../../private/syuko/syuko';
import { MessagePage } from '../../private/message/message';

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
                menu: "SEND_BUGGAGE_STATUS",
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
            }
        ]

    private loginUser: string = "";
    private loginPassword: string = "";

    constructor(
        public alertCtrl: AlertController,
        public navCtrl: NavController) {

    }

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
        }
    }
}
