import { Component, ViewChild } from "@angular/core";
import { Platform, LoadingController, ToastController, AlertController, TextInput, NavController} from "ionic-angular";
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Http, RequestOptions, Headers } from "@angular/http";
import { Keyboard } from 'ionic-native';
import { IsDispOperation } from "../../../inc/IsDispOperation";
import { Global, GDATA } from "../../../inc/Global";
import { IsIniOperation } from "../../../inc/IsIniOperation";
import { SearchDetailPage } from "../search_detail/search_detail";
import { Camera, CameraOptions } from '@ionic-native/camera';
import { SafeUrl } from '@angular/platform-browser/src/security/dom_sanitization_service';

@Component({
    selector:'page-buggage_status',
    templateUrl: 'buggage_status.html'
})

export class BuggageStatusPage {

    public image_uri: any; // 画像のdata_uri
    public image_uri_for_preview: SafeUrl; // 画像のdata_uriをプレビュー用にサニタイズ

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
    }

    async cmdSendMessage_Click() {
        let alert;

        alert = this.alertCtrl.create({
            subTitle: '送信しました',
            buttons: ['OK']
        });
        alert.present();
    }
}