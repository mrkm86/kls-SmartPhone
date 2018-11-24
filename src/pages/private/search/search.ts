import { Component, ViewChild } from "@angular/core";
import { Platform, LoadingController, ToastController, AlertController, TextInput, NavController} from "ionic-angular";
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Http, RequestOptions, Headers } from "@angular/http";
import { Keyboard } from 'ionic-native';
import { IsDispOperation } from "../../../inc/IsDispOperation";
import { Global, GDATA } from "../../../inc/Global";
import { IsIniOperation } from "../../../inc/IsIniOperation";
import { SearchDetailPage } from "../search_detail/search_detail";

@Component({
    selector:'page-search',
    templateUrl: 'search.html'
})

export class SearchPage {

    //変数用オブジェクト
    private GLOBAL_DATA: GDATA;

    //Focus用オブジェクト
    @ViewChild('txtKeyword') txtKeywordInput: TextInput;

    //********************************************************************************
    //コンストラクタ
    //********************************************************************************
    constructor(
        public alertCtrl: AlertController,
        public toastCtrl: ToastController,
        public platform: Platform,
        public barcodeScanner: BarcodeScanner,
        public loadingCtrl: LoadingController,
        public http: Http,
        public navCtrl: NavController) {

        //Init data
        this.GLOBAL_DATA = new GDATA();
    }

    //********************************************************************************
    //ページ読み込み時
    //********************************************************************************
    //ionViewDidEnter()
    //ionViewDidLoad()
    ionViewWillEnter() {
        setTimeout(() => {
            Keyboard.show() // for android
            this.txtKeywordInput.setFocus();
        }, 1000);
    }

    //********************************************************************************
    //スキャナーイベント
    //********************************************************************************
    Scanner_OnScanned(event: any) {

        //スキャン開始
        this.barcodeScanner.scan().then(data => {

            this.txtKeywordInput.value = data.text;
            //Search
            this.cmdSearch_Click();

        }, (err) => {
            console.log("Scan Unsuccessful: " + err);
        });
    }

    //*********************************************************
    //* バーコードスキャン後
    //*********************************************************
   async cmdSearch_Click() {

       if (this.txtKeywordInput.value.length == 0) {
           return;
       }

       IsDispOperation.IsWaitMessageBox(this.loadingCtrl, "データ送信中", true);

       //Trans data
       await this.In_TransKeyword();

       if (this.GLOBAL_DATA.Cnt == 0) {
           IsDispOperation.IsWaitMessageBox(this.loadingCtrl, "データ送信中", false);
           await IsDispOperation.IsMessageBox(this.alertCtrl, "該当するデータがありません", "エラー", "OK", "");
           await IsDispOperation.isSetFocus(this.txtKeywordInput);
           this.txtKeywordInput.value = "";
           return;
       }

       IsDispOperation.IsWaitMessageBox(this.loadingCtrl, "データ送信中", false);
    }
    

    //*********************************************************
    //* バーコードスキャン後
    //*********************************************************
    cmdDetails_Click(index: any) {

        if (index != null) {
            this.navCtrl.push(SearchDetailPage, { SEARCH_DATA: this.GLOBAL_DATA.Data[index]});
        }  
    }

    //********************************************************************************
    //
    //********************************************************************************
    fnc_DirSep_Add(path: string): string {
        var res = "";
        res = path;

        if (res.lastIndexOf('/') != res.length - 1) {
            res = res + '/';
        }

        return res;
    }

    //********************************************************************************
    //
    //********************************************************************************
    async In_TransKeyword(): Promise<any> {
        var apiUri = null;
        var headersReq = null;
        var options = null;
        var strLocationName = "";

        //apiUri = 'https://hsccloud-a522913.db.us2.oraclecloudapps.com/apex/hscdevelop/zaiko/api/';
        apiUri = await IsIniOperation.IsIniRead(Global.T_SETINI, 'API_URL');

        //Check URI is empty
        if (apiUri == null || apiUri == "") return;

        apiUri = this.fnc_DirSep_Add(apiUri);
        apiUri += 'stck-req' + '?';
        apiUri += 'T_KEYWORD=' + this.txtKeywordInput.value;

        //Set header
        headersReq = new Headers({
            'Content-Type': 'application/json'
        });

        //Set option
        options = new RequestOptions({ headers: headersReq });

        //Reset data
        this.GLOBAL_DATA = new GDATA();

        return new Promise((resolve, reject) => {
            this.http.get(apiUri, options)
                .subscribe((data) => {

                    var jsonItem = JSON.parse(data['_body'])
                    var items = jsonItem['items'];

                    if (items != null && items.length > 0) {
                        var i = 0;

                        for (i; i < items.length; i++) {
                            this.GLOBAL_DATA.Data.push([]);                                 //Init element
                            this.GLOBAL_DATA.Data[i][0] = items[i].id;                      //
                            this.GLOBAL_DATA.Data[i][1] = items[i].t_location_id;           //棚番
                            this.GLOBAL_DATA.Data[i][2] = items[i].t_location_name;         //棚名
                            this.GLOBAL_DATA.Data[i][3] = items[i].t_field1;                //品番
                            this.GLOBAL_DATA.Data[i][4] = items[i].t_field2;                //品名
                            this.GLOBAL_DATA.Data[i][5] = items[i].t_field3;                //仕入先
                            this.GLOBAL_DATA.Data[i][6] = items[i].t_field4;                //部署
                            this.GLOBAL_DATA.Data[i][7] = items[i].t_field5;                //任意フィールド
                            this.GLOBAL_DATA.Data[i][8] = items[i].t_field6;                //数量
                            this.GLOBAL_DATA.Data[i][9] = items[i].t_field7;                //単価
                            this.GLOBAL_DATA.Data[i][10] = items[i].t_field8;               //発注点
                            this.GLOBAL_DATA.Data[i][11] = items[i].t_field9;               //備考
                            this.GLOBAL_DATA.Data[i][12] = items[i].latest_inventory_data;  //
                            this.GLOBAL_DATA.Cnt++;
                        }
                    }

                    resolve(this.GLOBAL_DATA);
                }, (error) => {
                    alert('エラー' + '\n' + error);
                    resolve(null);
                });
        });
    }
}