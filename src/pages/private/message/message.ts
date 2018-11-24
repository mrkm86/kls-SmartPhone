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
    selector:'page-message',
    templateUrl: 'message.html'
})

export class MessagePage {

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