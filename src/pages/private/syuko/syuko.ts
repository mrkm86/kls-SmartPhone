//プラグイン/モジュールなど ---------------------------------------------------------
import { Component, ViewChild } from '@angular/core';
import { NavController, AlertController, ToastController, Platform, TextInput, Label, LoadingController, Button } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Vibration } from '@ionic-native/vibration';
import { Keyboard } from 'ionic-native';
import { Http, Headers, RequestOptions, Jsonp } from '@angular/http';

//HEARTIS関数 -----------------------------------------------------------------------
import { Global } from '../../../inc/Global';
import { IsDispOperation } from '../../../inc/IsDispOperation';
import { IsIniOperation } from '../../../inc/IsIniOperation';
import { IsStrOperation } from '../../../inc/IsStrOperation';

@Component({
    selector: 'page-syuko',
    templateUrl: 'syuko.html'
})

export class SyukoPage {
    //********************************************************************************
    //型宣言
    //********************************************************************************

    //処理の流れ用フラグ
    GLOBAL_INPUT_FLG =
        {
            "Global_inputflg": 0,
            "Global_prevflg": 0,
            "Global_nextflg": 0
        };

    //タッチパネル対策で、画面遷移IDを設定する
    MENU_ID =
        {
            "input_flg_BackToMenu": 0,
            "input_flg_Tanaban": 10,
            "input_flg_Hinban": 20,
            "input_flg_Suryo": 30,
            "input_flg_Write": 90
        };

    //Focus用オブジェクト
    @ViewChild('inputTanaban') txtTanaban: TextInput;
    @ViewChild('inputHinban') txtHinban: TextInput;
    @ViewChild('inputSuryo') txtSuryo: TextInput;

    lblTanamei: string;
    lblHinmei: string;
    isTanaHidden: boolean;
    isHinmeiHidden: boolean;

    //********************************************************************************
    //関数書き込み
    //********************************************************************************

    //********************************************************************************
    //コンストラクタ
    //********************************************************************************
    constructor(
        public nvavCtrl: NavController,
        public alertCtrl: AlertController,
        public toastCtrl: ToastController,
        public platform: Platform,
        public barcodeScanner: BarcodeScanner,
        public loadingCtrl: LoadingController,
        public http: Http) {
        //戻るボタンが押された場合のイベントを登録しておく
        platform.registerBackButtonAction(() => {
            this.onClick_BackButton();
        });
    }

    //********************************************************************************
    //戻るキーが押された場合(Android)
    //********************************************************************************
    onClick_BackButton() {
        switch (this.GLOBAL_INPUT_FLG.Global_inputflg) {
            //棚番入力
            case this.MENU_ID.input_flg_Tanaban:
                this.txtTanaban.value = "";
                break;

            //品番入力
            case this.MENU_ID.input_flg_Hinban:
                this.txtHinban.value = "";
                break;

            //数量入力
            case this.MENU_ID.input_flg_Suryo:
                this.txtSuryo.value = "";
                break;

            default:
                return;
        }
        //前項目に戻る
        this.GLOBAL_INPUT_FLG.Global_inputflg = this.GLOBAL_INPUT_FLG.Global_prevflg;
        this.Menu();
    }

    //********************************************************************************
    //ページ読み込み時
    //********************************************************************************
    ionViewWillEnter() {

        //初期化
        this.txtTanaban.value = "";
        this.txtHinban.value = "";
        this.txtSuryo.value = "";

        this.isTanaHidden = true;
        this.isHinmeiHidden = true;

        //初期画面へ移動 ----------------------------------------------------------------
        this.GLOBAL_INPUT_FLG.Global_inputflg = this.MENU_ID.input_flg_Tanaban;

        setTimeout(() => {
            Keyboard.show() // for android
            this.txtTanaban.setFocus();
        }, 1000);

        //初期画面へ移動 ----------------------------------------------------------------
    }

    //********************************************************************************
    //スキャナーイベント
    //********************************************************************************
    Scanner_OnScanned(event: any) {
        var ctrl = event.currentTarget.getAttribute("name");

        //どのスキャンボタンを押されたかによって、処理を分ける
        switch (ctrl) {
            case "btnTanaban":
                this.GLOBAL_INPUT_FLG.Global_inputflg = this.MENU_ID.input_flg_Tanaban;
                break;
            case "btnHinban":
                this.GLOBAL_INPUT_FLG.Global_inputflg = this.MENU_ID.input_flg_Hinban;
                break;
        }
        this.Menu();

        //スキャン開始
        this.barcodeScanner.scan().then(data => {

            console.log("Scan successful: " + data.text);

            switch (this.GLOBAL_INPUT_FLG.Global_inputflg) {
                //棚番入力
                case this.MENU_ID.input_flg_Tanaban:
                    this.txtTanaban.value = data.text;

                    this.txtTanaban_Scanned();
                    break;

                //品番入力
                case this.MENU_ID.input_flg_Hinban:
                    this.txtHinban.value = data.text;
                    this.txtHinban_Scanned();
                    break;

                default:
                    break;
            }

        }, (err) => {
            console.log("Scan Unsuccessful: " + err);
        });
    }

    //********************************************************************************
    //メイン画面
    //********************************************************************************
    Menu() {

        switch (this.GLOBAL_INPUT_FLG.Global_inputflg) 
        {
            case this.MENU_ID.input_flg_BackToMenu:
                break;

            //棚番入力
            case this.MENU_ID.input_flg_Tanaban:
                this.Tanaban();
                break;

            //品番入力
            case this.MENU_ID.input_flg_Hinban:
                this.Hinban();
                break;

            //数量入力
            case this.MENU_ID.input_flg_Suryo:
                this.Suryo();
                break;

            //ログ書き込み
            case this.MENU_ID.input_flg_Write:
                break;

            default:
                break;
        }
    }

    //********************************************************************************
    //棚番入力
    //********************************************************************************
    Tanaban() {
        IsDispOperation.isSetFocus(this.txtTanaban);
    }
    txtTanaban_GotFocus() {
        Global.CurrentControl = this.txtTanaban;

        //この処理と違うテキストボックスからタッチされた場合、行き先を再設定【重要】
        this.GLOBAL_INPUT_FLG.Global_inputflg = this.MENU_ID.input_flg_Tanaban;
        this.GLOBAL_INPUT_FLG.Global_prevflg = this.MENU_ID.input_flg_BackToMenu;
        this.GLOBAL_INPUT_FLG.Global_nextflg = this.MENU_ID.input_flg_Hinban;
    }
    async txtTanaban_LostFocus() {
        var itemJson = null;

        if (this.txtTanaban.value.length == 0 ) return;

        IsDispOperation.IsWaitMessageBox(this.loadingCtrl, "データ送信中", true);

        //Trans data
        itemJson = await this.TransTanaban();

        if (itemJson == null || itemJson.length == 0) {
            IsDispOperation.IsWaitMessageBox(this.loadingCtrl, "データ送信中", false);
            await IsDispOperation.IsMessageBox(this.alertCtrl, "該当しない棚番です", "エラー", "OK", "");
            await IsDispOperation.isSetFocus(this.txtTanaban);
            this.txtTanaban.value = "";
            return;
        }

        IsDispOperation.IsWaitMessageBox(this.loadingCtrl, "データ送信中", false, Global.CurrentControl);

        this.lblTanamei = itemJson[0].t_location_name;       
        this.isTanaHidden = false;
    }
    //*********************************************************
    //* バーコードスキャン後
    //*********************************************************
    txtTanaban_Scanned() {
        //入力チェック
        if (this.txtTanaban_InputCheck() == false) {
            this.txtTanaban.value = "";
            return;
        }

        this.GLOBAL_INPUT_FLG.Global_inputflg = this.GLOBAL_INPUT_FLG.Global_nextflg;
        this.Menu();
    }
    //*********************************************************
    //* 入力チェック
    //*********************************************************
    txtTanaban_InputCheck() {
        var ret = false;

        //桁数チェック
        if (this.txtTanaban.value.length == 0 || this.txtTanaban.value.length > 32) {
            //NG
            return ret;
        }

        //OK
        ret = true;
        return ret;
    }

    //********************************************************************************
    //品番入力
    //********************************************************************************
    Hinban() {
        IsDispOperation.isSetFocus(this.txtHinban);
    }
    txtHinban_GotFocus() {
        Global.CurrentControl = this.txtHinban;

        //この処理と違うテキストボックスからタッチされた場合、行き先を再設定【重要】
        this.GLOBAL_INPUT_FLG.Global_inputflg = this.MENU_ID.input_flg_Hinban;
        this.GLOBAL_INPUT_FLG.Global_prevflg = this.MENU_ID.input_flg_Tanaban;
        this.GLOBAL_INPUT_FLG.Global_nextflg = this.MENU_ID.input_flg_Suryo;
    }
    async txtHinban_LostFocus() {
        var itemJson = null;

        if (this.txtHinban.value.length == 0) return;
        IsDispOperation.IsWaitMessageBox(this.loadingCtrl, "データ送信中", "OK", true);

        //Trans data
        itemJson = await this.TransHinban();

        if (itemJson == null || itemJson.length == 0) {
            IsDispOperation.IsWaitMessageBox(this.loadingCtrl, "データ送信中", false);
            await IsDispOperation.IsMessageBox(this.alertCtrl, "該当しない品番です", "エラー", "OK", "");
            await IsDispOperation.isSetFocus(this.txtHinban);
            this.txtHinban.value = "";
            return;
        }

        IsDispOperation.IsWaitMessageBox(this.loadingCtrl, "データ送信中", false, Global.CurrentControl);

        this.lblHinmei = itemJson[0].t_field2;
        this.isHinmeiHidden = false;
    }
    //*********************************************************
    //* バーコードスキャン後
    //*********************************************************
    txtHinban_Scanned() {
        //入力チェック
        if (this.txtHinban_InputCheck() == false) {
            this.txtHinban.value = "";
            return;
        }

        this.GLOBAL_INPUT_FLG.Global_inputflg = this.GLOBAL_INPUT_FLG.Global_nextflg;
        this.Menu();
    }
    //*********************************************************
    //* 入力チェック
    //*********************************************************
    txtHinban_InputCheck() {
        var ret = false;

        //桁数チェック
        if (this.txtHinban.value.length == 0 || this.txtHinban.value.length > 7089) {
            //NG
            return ret;
        }

        //OK
        ret = true;
        return ret;
    }

    //********************************************************************************
    //数量入力
    //********************************************************************************
    Suryo() {
        IsDispOperation.isSetFocus(this.txtSuryo);
    }
    txtSuryo_GotFocus() {
        Global.CurrentControl = this.txtSuryo;

        //この処理と違うテキストボックスからタッチされた場合、行き先を再設定【重要】
        this.GLOBAL_INPUT_FLG.Global_inputflg = this.MENU_ID.input_flg_Suryo;
        this.GLOBAL_INPUT_FLG.Global_prevflg = this.MENU_ID.input_flg_Hinban;
        this.GLOBAL_INPUT_FLG.Global_nextflg = this.MENU_ID.input_flg_Write;

        //キーボード表示
        Keyboard.show(); // for android
    }
    //*********************************************************
    //* バーコードスキャン後
    //*********************************************************
    txtSuryo_Scanned() {
        //入力チェック
        if (this.txtSuryo_InputCheck() == false) {
            this.txtSuryo.value = "";
            return;
        }

        //数字チェック
        if (this.isNumber(this.txtSuryo.value) == false) {
            this.txtSuryo.value = "";
            return;
        }

        this.GLOBAL_INPUT_FLG.Global_inputflg = this.GLOBAL_INPUT_FLG.Global_nextflg;
        this.Menu();
    }
    //*********************************************************
    //* 入力チェック
    //*********************************************************
    txtSuryo_InputCheck() {
        var ret = false;

        //桁数チェック
        if (this.txtSuryo.value.length == 0 || this.txtSuryo.value.length > 10) {
            //NG
            return ret;
        }

        //OK
        ret = true;
        return ret;
    }
    //********************************************************************************
    //数値判定
    //********************************************************************************
    isNumber(val) {
        var regex = new RegExp(/^[-+]?[0-9]+(\.[0-9]+)?$/);
        return regex.test(val);
    }
    //********************************************************************************
    //データ確定
    //********************************************************************************
    async WriteLog() {
        //通信
        var ret = await this.Write_Trans();

        if (ret == -1) {
            IsDispOperation.IsWaitMsgBoxMoment(this.toastCtrl, "エラー", 'bottom', 1000);
            return;
        }

        //メッセージ
        IsDispOperation.IsWaitMsgBoxMoment(this.toastCtrl, "登録されました", 'bottom', 1000);

        this.txtHinban.value = "";
        this.txtSuryo.value = "";
        this.lblHinmei = "";
        this.isHinmeiHidden = true;

        this.GLOBAL_INPUT_FLG.Global_inputflg = this.GLOBAL_INPUT_FLG.Global_nextflg;
        this.Menu();
    }

    //********************************************************************************
    //確定ボタン
    //********************************************************************************
    async cmdRegist_Click(event:any)
    {
        //入力チェック

        //棚番 -------------------------------------------------------------
        if (this.txtTanaban_InputCheck() == false) {
            await IsDispOperation.IsMessageBox(this.alertCtrl, "棚番の桁数が不正です", "エラー", "OK", "");
            await IsDispOperation.isSetFocus(this.txtTanaban, Keyboard);

            return;
        }
        //棚番 -------------------------------------------------------------

        //品番 -------------------------------------------------------------
        if (this.txtHinban_InputCheck() == false) {
            await IsDispOperation.IsMessageBox(this.alertCtrl, "品番の桁数が不正です", "エラー", "OK", "");
            await IsDispOperation.isSetFocus(this.txtHinban);
            return;
        }
        //品番 -------------------------------------------------------------

        //数量 -------------------------------------------------------------
        if (this.txtSuryo_InputCheck() == false) {
            await IsDispOperation.IsMessageBox(this.alertCtrl, "数量の桁数が不正です", "エラー", "OK", "");
            await IsDispOperation.isSetFocus(this.txtSuryo);
            return;
        }
        //数量 -------------------------------------------------------------

        //この処理と違うテキストボックスからタッチされた場合、行き先を再設定【重要】
        this.GLOBAL_INPUT_FLG.Global_inputflg = this.MENU_ID.input_flg_Write;
        this.GLOBAL_INPUT_FLG.Global_prevflg = this.MENU_ID.input_flg_Suryo;
        this.GLOBAL_INPUT_FLG.Global_nextflg = this.MENU_ID.input_flg_Hinban;

        //確定
        this.WriteLog();
    }

    //********************************************************************************
    //棚番要求
    //********************************************************************************
    async TransTanaban(): Promise<any> {
        var apiUri = null;
        var headersReq = null;
        var options = null;

        //apiUri = 'https://hsccloud-a522913.db.us2.oraclecloudapps.com/apex/hscdevelop/zaiko/api';
        apiUri = await IsIniOperation.IsIniRead(Global.T_SETINI, 'API_URL');
        
        //Check URI is empty
        if (apiUri == null || apiUri == "") return;

        apiUri = IsStrOperation.fnc_DirSep_Add(apiUri);
        apiUri += 'loca-req' + '?';
        apiUri += 'T_LOCATION_ID=' + this.txtTanaban.value;

        //Set header
        headersReq = new Headers({
            'Content-Type': 'application/json'
        });
        //Set option
        options = new RequestOptions({ headers: headersReq });

        return new Promise((resolve, reject) => {
            this.http.get(apiUri, options)
                .subscribe((data) => {
                    var jsonItem = JSON.parse(data['_body'])
                    resolve(jsonItem['items']);

                }, (error) => {
                    alert('エラー' + '\n' + error);
                    resolve(null);
                });
        });
    }

    //********************************************************************************
    //品番要求
    //********************************************************************************
    async TransHinban(): Promise<any> {
        var apiUri = null;
        var headersReq = null;
        var options = null;

        //apiUri = 'https://hsccloud-a522913.db.us2.oraclecloudapps.com/apex/hscdevelop/zaiko/api';
        apiUri = await IsIniOperation.IsIniRead(Global.T_SETINI, 'API_URL');

        //Check URI is empty
        if (apiUri == null || apiUri == "") return;

        apiUri = IsStrOperation.fnc_DirSep_Add(apiUri);
        apiUri += 'item-req' + '?';
        apiUri += 'T_FIELD1=' + this.txtHinban.value;

        //Set header
        headersReq = new Headers({
            'Content-Type': 'application/json'
        });

        //Set option
        options = new RequestOptions({ headers: headersReq });

        return new Promise((resolve, reject) => {
            this.http.get(apiUri, options)
                .subscribe((data) => {
                    var jsonItem = JSON.parse(data['_body'])
                    resolve(jsonItem['items']);

                }, (error) => {
                    alert('エラー' + '\n' + error);
                    resolve(null);
                });
        });
    }

    //********************************************************************************
    //要求
    //********************************************************************************
    async Write_Trans() : Promise<any> {
        var apiUri = null;

        //apiUri = 'https://hsccloud-a522913.db.us2.oraclecloudapps.com/apex/hscdevelop/zaiko/api';
        apiUri = await IsIniOperation.IsIniRead(Global.T_SETINI, 'API_URL');

        //Check URI is empty
        if (apiUri == null || apiUri == "") return;

        apiUri = IsStrOperation.fnc_DirSep_Add(apiUri);
        apiUri += 'dcmp-cmp' + '?';
        apiUri += 'T_MODE=' + '2';
        apiUri += '&T_PIC=' + Global.g_Tanto;
        apiUri += '&T_LOCATION_ID=' + this.txtTanaban.value;
        apiUri += '&T_FIELD1=' + this.txtHinban.value;
        apiUri += '&T_VALUE=' + this.txtSuryo.value;
    
        return new Promise((resolve, reject) => {
            this.http.put(apiUri, null)
                .subscribe((data) => {
                    if (data['status'] == 200) {
                        resolve(0);
                    }
                    else {
                        resolve(-1);
                    }
                }, (error) => {
                    //alert('エラー2' + '\n' + error);
                    resolve(-1);
                });
        });        
    }
}
