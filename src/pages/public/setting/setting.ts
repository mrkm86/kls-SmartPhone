//プラグイン/モジュールなど ---------------------------------------------------------
import { Component, ViewChild } from '@angular/core';
import { NavController, TextInput, AlertController} from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { IsIniOperation } from '../../../inc/IsIniOperation';
import { Http, Headers, RequestOptions } from '@angular/http';

//HEARTIS関数 -----------------------------------------------------------------------
import { Global } from '../../../inc/Global';
import { IsDispOperation } from '../../../inc/IsDispOperation';
import { IsStrOperation } from '../../../inc/IsStrOperation';

@Component({
    selector: 'page-setting',
    templateUrl: 'setting.html'
})
export class SettingPage {
    //********************************************************************************
    //型宣言
    //********************************************************************************

    //処理の流れ用フラグ
    GLOBAL_INPUT_FLG =
        {
            "Global_inputflg": 0,
        };

    //タッチパネル対策で、画面遷移IDを設定する
    MENU_ID =
        {
            "input_flg_Url": 0,
            "input_flg_User": 10,
            "input_flg_Password": 20,
        };

    barcodeData: string;
    @ViewChild('txtUrlInput') txtUrl: TextInput;
    @ViewChild('txtLoginUserInput') txtLoginUser: TextInput;
    @ViewChild('txtLoginPasswordInput') txtLoginPassword: TextInput;

    constructor(
        public navCtrl: NavController,
        public alertCtrl: AlertController,
        public barcodeScanner: BarcodeScanner,
        public http: Http, ) {
    }

    //********************************************************************************
    //ページ読み込み時
    //********************************************************************************
    async ionViewWillEnter() {

        //Read value
        this.txtUrl.value = await IsIniOperation.IsIniRead(Global.T_SETINI, 'API_URL');
        this.txtLoginUser.value = await IsIniOperation.IsIniRead(Global.T_SETINI, 'LOGIN_USER');
        this.txtLoginPassword.value = await IsIniOperation.IsIniRead(Global.T_SETINI, 'PASSWORD');
    }

    //********************************************************************************
    //ページクローズ時
    //********************************************************************************
    async ionViewWillLeave() {
        var itemJson = null;

        if (this.txtUrl.value == '' || this.txtLoginUser.value == '' || this.txtLoginPassword.value == '') {
            return;
        }
      
        //Trans data
        itemJson = await this.TransSignIn();

        if (itemJson == null || itemJson.length == 0) {
            await IsDispOperation.IsMessageBox(this.alertCtrl, "ログインできませんでした", "エラー", "OK", "");
            return;
        }
        else
        {
            await IsIniOperation.IsIniWrite(Global.T_SETINI, 'API_URL', this.txtUrl.value)
            .then(() => {
                IsIniOperation.IsIniWrite(Global.T_SETINI, 'LOGIN_USER', this.txtLoginUser.value);
            })
            .then(() => {
                IsIniOperation.IsIniWrite(Global.T_SETINI, 'PASSWORD', this.txtLoginPassword.value);
            })
            .then(() => {
                //担当者コード
                Global.g_Tanto = this.txtLoginUser.value;
            });
        }
    }

    //********************************************************************************
    //スキャナーイベント
    //********************************************************************************
    Scanner_OnScanned(event: any) {
        var ctrl = event.currentTarget.getAttribute("name");

        //どのスキャンボタンを押されたかによって、処理を分ける
        switch (ctrl) {
            case "btnInputUrl":
                this.GLOBAL_INPUT_FLG.Global_inputflg = this.MENU_ID.input_flg_Url;
                break;
            case "btnInputUser":
                this.GLOBAL_INPUT_FLG.Global_inputflg = this.MENU_ID.input_flg_User;
                break;
            case "btnInputPassword":
                this.GLOBAL_INPUT_FLG.Global_inputflg = this.MENU_ID.input_flg_Password;
                break;
        }

        //スキャン開始
        this.barcodeScanner.scan().then(data => {

            console.log("Scan successful: " + data.text);

            switch (this.GLOBAL_INPUT_FLG.Global_inputflg) {
                //Api-url
                case this.MENU_ID.input_flg_Url:
                    this.txtUrl.value = data.text
                    break;

                //Username
                case this.MENU_ID.input_flg_User:
                    this.txtLoginUser.value = data.text
                    break;

                //Password
                case this.MENU_ID.input_flg_Password:
                    this.txtLoginPassword.value = data.text
                    break;

                default:
                    break;
            }
        }, (err) => {
            console.log("Scan Unsuccessful: " + err);
        });
    }

    async TransSignIn() : Promise<any> {
        var apiUri = null;

        //Set URL
        apiUri = this.txtUrl.value;

        //Check URI is empty
        if (apiUri == null || apiUri == "") return;

        apiUri = IsStrOperation.fnc_DirSep_Add(apiUri);
        apiUri += 'tnto-req2' + '?';
        apiUri += 'T_PIC=' + this.txtLoginUser.value;
        apiUri += '&T_PASSWORD=' + this.txtLoginPassword.value;

        return new Promise((resolve, reject) => {
            this.http.get(apiUri, null)
                .subscribe((data) => {
                    var jsonItem = JSON.parse(data['_body'])
                    resolve(jsonItem['items']);

                }, (error) => {
                    alert('エラー' + '\n' + error);
                    resolve(null);
                });
        }); 
    }
}
