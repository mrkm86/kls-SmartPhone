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
            "input_flg_BDADDRESS": 0,
            "input_flg_Url": 10
        };

    barcodeData: string;
    @ViewChild('InputBDADDRESS') txtBDADDRESS: TextInput;
    @ViewChild('txtUrlInput') txtUrl: TextInput;

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
        this.txtBDADDRESS.value = await IsIniOperation.IsIniRead(Global.T_SETINI, 'BDADDRESS');
        this.txtUrl.value = await IsIniOperation.IsIniRead(Global.T_SETINI, 'API_URL');
    }

    //********************************************************************************
    //ページクローズ時
    //********************************************************************************
    async ionViewWillLeave() {

        await IsIniOperation.IsIniWrite(Global.T_SETINI, 'BDADDRESS', this.txtBDADDRESS.value)
        .then(() => {
            IsIniOperation.IsIniWrite(Global.T_SETINI, 'API_URL', this.txtUrl.value);
        });

    }

    //********************************************************************************
    //スキャナーイベント
    //********************************************************************************
    Scanner_OnScanned(event: any) {
        var ctrl = event.currentTarget.getAttribute("name");

        //どのスキャンボタンを押されたかによって、処理を分ける
        switch (ctrl) {
            case "btnBDADDRESS":
                this.GLOBAL_INPUT_FLG.Global_inputflg = this.MENU_ID.input_flg_BDADDRESS;
                break;
            case "btnInputUrl":
                this.GLOBAL_INPUT_FLG.Global_inputflg = this.MENU_ID.input_flg_Url;
                break;
        }

        //スキャン開始
        this.barcodeScanner.scan().then(data => {

            console.log("Scan successful: " + data.text);

            switch (this.GLOBAL_INPUT_FLG.Global_inputflg) {
                //BDADDRESS
                case this.MENU_ID.input_flg_BDADDRESS:
                    this.txtBDADDRESS.value = data.text
                    break;

                //Api-url
                case this.MENU_ID.input_flg_Url:
                    this.txtUrl.value = data.text
                    break;

                default:
                    break;
            }
        }, (err) => {
            console.log("Scan Unsuccessful: " + err);
        });
    }
}
