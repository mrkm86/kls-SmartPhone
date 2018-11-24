//プラグイン/モジュールなど ---------------------------------------------------------
import { Component, ViewChild } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { NavController, AlertController, ToastController, Platform, TextInput, Label, LoadingController, Button } from 'ionic-angular';
import { Http, Headers, RequestOptions, Jsonp } from '@angular/http';

//HEARTIS関数 -----------------------------------------------------------------------
import { Global } from '../../../inc/Global';
import { IsDispOperation } from '../../../inc/IsDispOperation';
import { IsIniOperation } from '../../../inc/IsIniOperation';
import { IsStrOperation } from '../../../inc/IsStrOperation';

//個別ページ ------------------------------------------------------------------------
import { HomePage } from '../home/home';

@Component({
    selector: 'page-login',
    templateUrl: 'login.html'
})

export class LoginPage {
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
            "input_flg_LoginUser": 10,
            "input_flg_LoginPassWord": 20,
            "input_flg_CarNo": 30,
            "input_flg_Write": 90
        };

    @ViewChild('inputLoginUser') txtLoginUser: TextInput;
    @ViewChild('inputLoginPassWord') txtLoginPassWord: TextInput;
    @ViewChild('inputCarNo') txtCarNo: TextInput;

    constructor(
        public navCtrl: NavController,
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

    async ionViewWillEnter() {

        //初期化
        this.txtLoginUser.value = await IsIniOperation.IsIniRead(Global.T_SETINI, 'LOGIN_USER');
        this.txtLoginPassWord.value = await IsIniOperation.IsIniRead(Global.T_SETINI, 'PASSWORD');
        this.txtCarNo.value = await IsIniOperation.IsIniRead(Global.T_SETINI, 'CARNO');

        //初期画面へ移動 ----------------------------------------------------------------
        this.GLOBAL_INPUT_FLG.Global_inputflg = this.MENU_ID.input_flg_LoginUser;

        //初期画面へ移動 ----------------------------------------------------------------
    }

    //********************************************************************************
    //戻るキーが押された場合(Android)
    //********************************************************************************
    onClick_BackButton() {
        switch (this.GLOBAL_INPUT_FLG.Global_inputflg) {
            //ユーザーID入力
            case this.MENU_ID.input_flg_LoginUser:
                //this.txtLoginUser.value = "";
                break;

            //パスワード入力
            case this.MENU_ID.input_flg_LoginPassWord:
                this.txtLoginPassWord.value = "";
                break;

            //号車入力
            case this.MENU_ID.input_flg_CarNo:
                this.txtCarNo.value = "";
                break;

            default:
                return;
        }
        //前項目に戻る
        this.GLOBAL_INPUT_FLG.Global_inputflg = this.GLOBAL_INPUT_FLG.Global_prevflg;
        this.Menu();
    }

    //********************************************************************************
    //スキャナーイベント
    //********************************************************************************
    Scanner_OnScanned(event: any) {
        var ctrl = event.currentTarget.getAttribute("name");

        //どのスキャンボタンを押されたかによって、処理を分ける
        switch (ctrl)
        {
            case "btnLoginUser":
                this.GLOBAL_INPUT_FLG.Global_inputflg = this.MENU_ID.input_flg_LoginUser;
                break;
            case "btnLoginPassWord":
                this.GLOBAL_INPUT_FLG.Global_inputflg = this.MENU_ID.input_flg_LoginPassWord;
                break;
            case "btnCarNo":
                this.GLOBAL_INPUT_FLG.Global_inputflg = this.MENU_ID.input_flg_CarNo;
                break;
        }
        this.Menu();

        //スキャン開始
        this.barcodeScanner.scan().then(data => {

            console.log("Scan successful: " + data.text);

            switch (this.GLOBAL_INPUT_FLG.Global_inputflg)
            {
                //ログインID入力
                case this.MENU_ID.input_flg_LoginUser:
                    this.txtLoginUser.value = data.text;
                    this.txtLoginUser_Scanned();
                    break;

                //パスワード入力
                case this.MENU_ID.input_flg_LoginPassWord:
                    this.txtLoginPassWord.value = data.text;
                    this.txtLoginPassWord_Scanned();
                    break;

                //号車入力
                case this.MENU_ID.input_flg_CarNo:
                    this.txtCarNo.value = data.text;
                    this.txtCarNo_Scanned();
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
    Menu()
    {
        switch (this.GLOBAL_INPUT_FLG.Global_inputflg) 
        {
            case this.MENU_ID.input_flg_BackToMenu:
                break;

            //ユーザーID入力
            case this.MENU_ID.input_flg_LoginUser:
                this.LoginUser();
                break;

            //パスワード入力
            case this.MENU_ID.input_flg_LoginPassWord:
                this.LoginPassWord();
                break;

            //号車入力
            case this.MENU_ID.input_flg_CarNo:
                this.CarNo();
                break;

            //ログ書き込み
            case this.MENU_ID.input_flg_Write:
                break;

            default:
                break;
        }
    }

    //********************************************************************************
    //ログインID入力
    //********************************************************************************
    LoginUser() {
        IsDispOperation.isSetFocus(this.txtLoginUser);
    }
    txtLoginUser_GotFocus() {
        Global.CurrentControl = this.txtLoginUser;

        //この処理と違うテキストボックスからタッチされた場合、行き先を再設定【重要】
        this.GLOBAL_INPUT_FLG.Global_inputflg = this.MENU_ID.input_flg_LoginUser;
        this.GLOBAL_INPUT_FLG.Global_prevflg = this.MENU_ID.input_flg_BackToMenu;
        this.GLOBAL_INPUT_FLG.Global_nextflg = this.MENU_ID.input_flg_LoginPassWord;
    }
    //*********************************************************
    //* バーコードスキャン後
    //*********************************************************
    txtLoginUser_Scanned() {
        //入力チェック
        if (this.txtLoginUser_InputCheck() == false) {
            this.txtLoginUser.value = "";
            return;
        }

        this.GLOBAL_INPUT_FLG.Global_inputflg = this.GLOBAL_INPUT_FLG.Global_nextflg;
        this.Menu();
    }
    //*********************************************************
    //* 入力チェック
    //*********************************************************
    txtLoginUser_InputCheck() {
        var ret = false;

        //桁数チェック
        if (this.txtLoginUser.value.length == 0 || this.txtLoginUser.value.length > 32) {
            //NG
            return ret;
        }

        //OK
        ret = true;
        return ret;
    }

    //********************************************************************************
    //パスワード入力
    //********************************************************************************
    LoginPassWord() {
        IsDispOperation.isSetFocus(this.txtLoginPassWord);
    }
    txtLoginPassWord_GotFocus() {
        Global.CurrentControl = this.txtLoginPassWord;

        //この処理と違うテキストボックスからタッチされた場合、行き先を再設定【重要】
        this.GLOBAL_INPUT_FLG.Global_inputflg = this.MENU_ID.input_flg_LoginPassWord;
        this.GLOBAL_INPUT_FLG.Global_prevflg = this.MENU_ID.input_flg_LoginUser;
        this.GLOBAL_INPUT_FLG.Global_nextflg = this.MENU_ID.input_flg_CarNo;
    }
    //*********************************************************
    //* バーコードスキャン後
    //*********************************************************
    txtLoginPassWord_Scanned() {
        //入力チェック
        if (this.txtLoginPassWord_InputCheck() == false) {
            this.txtLoginPassWord.value = "";
            return;
        }

        this.GLOBAL_INPUT_FLG.Global_inputflg = this.GLOBAL_INPUT_FLG.Global_nextflg;
        this.Menu();
    }
    //*********************************************************
    //* 入力チェック
    //*********************************************************
    txtLoginPassWord_InputCheck() {
        var ret = false;

        //桁数チェック
        if (this.txtLoginPassWord.value.length == 0 || this.txtLoginPassWord.value.length > 32) {
            //NG
            return ret;
        }

        //OK
        ret = true;
        return ret;
    }

   //********************************************************************************
    //号車入力
    //********************************************************************************
    CarNo() {
        IsDispOperation.isSetFocus(this.txtCarNo);
    }
    txtCarNo_GotFocus() {
        Global.CurrentControl = this.txtCarNo;

        //この処理と違うテキストボックスからタッチされた場合、行き先を再設定【重要】
        this.GLOBAL_INPUT_FLG.Global_inputflg = this.MENU_ID.input_flg_CarNo;
        this.GLOBAL_INPUT_FLG.Global_prevflg = this.MENU_ID.input_flg_LoginPassWord;
        this.GLOBAL_INPUT_FLG.Global_nextflg = this.MENU_ID.input_flg_Write;
    }
    //*********************************************************
    //* バーコードスキャン後
    //*********************************************************
    txtCarNo_Scanned() {
        //入力チェック
        if (this.txtCarNo_InputCheck() == false) {
            this.txtCarNo.value = "";
            return;
        }

        this.GLOBAL_INPUT_FLG.Global_inputflg = this.GLOBAL_INPUT_FLG.Global_nextflg;
        this.Menu();
    }
    //*********************************************************
    //* 入力チェック
    //*********************************************************
    txtCarNo_InputCheck() {
        var ret = false;

        //桁数チェック
        if (this.txtCarNo.value.length > 5) {
            //NG
            return ret;
        }

        //OK
        ret = true;
        return ret;
    }

    async cmdSignIn_Click() {
        let alert;

        if (this.txtLoginUser.value == '' || this.txtLoginPassWord.value == '' ) {
            alert = this.alertCtrl.create({
                title: 'エラー',
                subTitle: '必要な項目を入力してください',
                buttons: ['OK']
            });
            alert.present();
            return;
        }

        await IsIniOperation.IsIniWrite(Global.T_SETINI, 'LOGIN_USER', this.txtLoginUser.value)
        .then(() => {
            IsIniOperation.IsIniWrite(Global.T_SETINI, 'PASSWORD', this.txtLoginPassWord.value);
        })
        .then(() => {
            IsIniOperation.IsIniWrite(Global.T_SETINI, 'CARNO', this.txtCarNo.value);
        });

        alert = this.alertCtrl.create({
            title: 'ようこそ',
            subTitle: 'ログインしました',
            buttons: ['OK']
        });
        alert.present();
    }

/*
    //Sign in function.
    async cmdSignIn_Click() {

        var apiUri = null;
        var headersReq = null;
        var options = null;
        var strSQL = '';

        if (this.txtLoginUser.value == '' || this.txtLoginPassword.value == '') {
            return;
        }

        //Set URL
        //apiUri = 'https://hsccloud-a522913.db.us2.oraclecloudapps.com/apex/hscdevelop/zaiko/api/tnto-req2?';
        apiUri = await IsIniOperation.IsIniRead(Global.T_SETINI, 'API_URL');

        //20180926 ANHLD ADD START
        //Check URI is empty
        if (apiUri == null || apiUri == "") return;

        if (apiUri.lastIndexOf('/') != apiUri.length - 1) {
            apiUri = apiUri + '/';
        }

        apiUri += 'tnto-req2' + '?';
        //20180926 ANHLD ADD END
        apiUri += 'T_PIC=' + this.txtLoginUser.value;
        apiUri += '&T_PASSWORD=' + this.txtLoginPassword.value;

        //Set header
        headersReq = new Headers({
            'Content-Type': 'application/json'
        });

        options = new RequestOptions({ headers: headersReq });

        this.http.get(apiUri, options)
            .subscribe(async data => {
                try {
                    var jsonItem = JSON.parse(data['_body']);

                    if (jsonItem['items'] != null && jsonItem['items'].length > 0) {

                        await IsIniOperation.IsIniWrite(Global.T_SETINI, 'LOGIN_USER', this.txtLoginUser.value);
                        await IsIniOperation.IsIniWrite(Global.T_SETINI, 'PASSWORD', this.txtLoginPassword.value);
                        Global.g_Tanto = this.txtLoginUser.value;
                        //20180926 ANHLD ADD
                        alert('完了しました！');
                    }
                } catch (error) {
                    alert('エラー' + '\n' + error);
                }

            }, error => {
                alert('エラー' + '\n' + error);
            });
    }
    */
}
