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

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    //メニュー一覧
    MENUINFO =
        [
            {
                menu: "NYUKO",
                DispTitle: "入庫処理",
                icon: "arrow-round-forward",
                color: "NYUKOSEL"
            },
            {
                menu: "SYUKO",
                DispTitle: "出庫処理",
                icon: "arrow-round-back",
                color: "SYUKOSEL"
            },
            {
                menu: "TANAOROSI",
                DispTitle: "棚卸処理",
                icon: "md-clipboard",
                color: "TANASEL"
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

            case "TANAOROSI":
                //20180912 ANHLD EDIT START
                //var strAnswer = IsDispOperation.IsMessageBox(this.alertCtrl, "どうしますか！？", "エラー", "YESNO", "");
                var strAnswer = await IsDispOperation.IsMessageBox(this.alertCtrl, "どうしますか！？", "エラー", "YESNO", "");
                //20180912 ANHLD EDIT END
                alert(strAnswer);
                //this.navCtrl.push(NyukoPage, { index: val });
                break;
        }
    }
}
