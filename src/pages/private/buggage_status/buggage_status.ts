import { Component } from "@angular/core";
import { Platform, LoadingController, ToastController, AlertController, NavController } from "ionic-angular";
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Http } from "@angular/http";
import { CameraOptions, Camera } from '@ionic-native/camera';
import { SafeUrl } from '@angular/platform-browser/src/security/dom_sanitization_service';

@Component({
    selector: 'page-buggage_status',
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
        public navCtrl: NavController,
        private camera: Camera) { //20181203 ANHLD EDIT add camera

        this.image_uri = "assets/image/no_image.png";
    }

    async cmdSendMessage_Click() {
        let alert;

        alert = this.alertCtrl.create({
            subTitle: '送信しました',
            buttons: ['OK']
        });
        alert.present();
    }

    //20181203 ANHLD ADD START
    async cmdSelectImage_Click(event: any) {
        
        var ctrl = event.currentTarget.getAttribute("name");

        //どのボタンを押されたかによって、処理を分ける
        switch (ctrl) {

            case "btnCamera":
                const optionsCamera: CameraOptions = {
                    quality: 100,
                    sourceType: this.camera.PictureSourceType.CAMERA,
                    destinationType: this.camera.DestinationType.DATA_URL,
                    encodingType: this.camera.EncodingType.JPEG,
                    mediaType: this.camera.MediaType.PICTURE
                }

                this.camera.getPicture(optionsCamera).then((imageData) => {
                    this.image_uri = 'data:image/jpeg;base64,' + imageData;

                }, (err) => {
                    // Handle error
                    console.log(err);
                })

                break;

            case "btnImage":
                const optionsGallery: CameraOptions = {
                    quality: 100,
                    sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
                    destinationType: this.camera.DestinationType.DATA_URL,
                    encodingType: this.camera.EncodingType.JPEG,
                    mediaType: this.camera.MediaType.PICTURE
                }

                this.camera.getPicture(optionsGallery).then((imageData) => {
                    this.image_uri = 'data:image/jpeg;base64,' + imageData;

                }, (err) => {
                    // Handle error
                    console.log(err);
                })
                break;
        }
    }
    //20181203 ANHLD ADD END
}