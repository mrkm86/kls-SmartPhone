//20180912 ANHLD DELETE START
//import { Component } from '@angular/core';

//import { NavController } from 'ionic-angular';

//@Component({
//  selector: 'page-login',
//  templateUrl: 'login.html'
//})
//export class LoginPage {

//  constructor(public navCtrl: NavController) {

//  }

//}
//20180912 ANHLD DELETE END

//20180912 ANHLD ADD START
import { Component, ViewChild } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { NavController, Header, TextInput } from 'ionic-angular';
import { Http, Headers, RequestOptions, Jsonp } from '@angular/http';
import { IsIniOperation } from '../../../inc/IsIniOperation';     //20180918 ANHLD ADD
import { Global } from '../../../inc/Global';                     //20180918 ANHLD ADD
import { FilePath } from 'ionic-native';

@Component({
    selector: 'page-login',
    templateUrl: 'login.html'
})

export class LoginPage {

    @ViewChild('txtLoginUser') txtLoginUserInput: TextInput;
    @ViewChild('txtLoginPassword') txtLoginPasswordInput: TextInput;

    constructor(
        public navCtrl: NavController,
        public barcodeScanner: BarcodeScanner,
        public http: Http
    ) { }

    async ionViewWillEnter() {
        //20180924 ANHLD EDIT START
        //this.txtLoginUserInput.value = '';
        //this.txtLoginPasswordInput.value = '';

        //Read value
        this.txtLoginUserInput.value = await IsIniOperation.IsIniRead(Global.T_SETINI, 'LOGIN_USER');
        this.txtLoginPasswordInput.value = await IsIniOperation.IsIniRead(Global.T_SETINI, 'PASSWORD');
        //20180924 ANHLD EDIT END
    }

    onScan(sender: String) {
        ////スキャン開始
        this.barcodeScanner.scan().then(data => {

            console.log("Scan successful: " + data.text);

            switch (sender) {
                case "txtLoginUser":
                    this.txtLoginUserInput.value = data.text;
                    break;
                case "txtLoginPassword":
                    this.txtLoginPasswordInput.value = data.text;
                    break;
            }

        }, (err) => {
            console.log("Scan Unsuccessful: " + err);
        });
    }

    //Sign in function.
    async cmdSignIn_Click() {

        var apiUri = null;
        var headersReq = null;
        var options = null;
        var strSQL = '';

        if (this.txtLoginUserInput.value == '' || this.txtLoginPasswordInput.value == '') {
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
        apiUri += 'T_PIC=' + this.txtLoginUserInput.value;
        apiUri += '&T_PASSWORD=' + this.txtLoginPasswordInput.value;

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

                        await IsIniOperation.IsIniWrite(Global.T_SETINI, 'LOGIN_USER', this.txtLoginUserInput.value);
                        await IsIniOperation.IsIniWrite(Global.T_SETINI, 'PASSWORD', this.txtLoginPasswordInput.value);
                        Global.g_Tanto = this.txtLoginUserInput.value;
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
}

//20180912 ANHLD ADD END
