//プラグイン/モジュールなど ---------------------------------------------------------
import { AlertController, LoadingController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
//20180912 ANHLD ADD START
import { Platform } from 'ionic-angular';
import { Keyboard } from 'ionic-native';
import { Global } from './Global';
 //20180912 ANHLD ADD END
 
//HEARTIS関数 -----------------------------------------------------------------------

export class IsDispOperation {

    static loading; //20180926 ANHLD ADD
    //static alertCtrl = AlertController;
    //static toastCtrl: ToastController;

    /// <summary>
    /// メッセージボックス
    /// </summary>
    /// <param name="strMessage">表示対象</param>
    /// <param name="strTitle">タイトル</param>
    /// <param name="strType"></param>
    /// <returns></returns>
    static async IsMessageBox(
        alertCtrl,
        strMessage,
        strTitle,
        strType,
        strFocus): Promise<any> {

        var resolveLeaving;

        //OKの時の選択肢
        var BUTTON_OK =
            [
                {
                    text: 'OK',
                    role: 'OK',
                    handler: () => resolveLeaving('OK')
                }
            ]

        //YESNOの時の選択肢
        var BUTTON_YESNO =
            [
                {
                    text: 'はい',
                    role: 'YES',
                    handler: () => resolveLeaving('YES')
                },
                {
                    text: 'いいえ',
                    role: 'NO',
                    handler: () => resolveLeaving('NO')
                }
            ]

        var buttons_Choice;

        switch (strType) {
            case "OK":
                buttons_Choice = BUTTON_OK;
                break;
            case "YESNO":
                buttons_Choice = BUTTON_YESNO;
                break;
        }

        const canLeave = new Promise<any>(resolve => resolveLeaving = resolve);
        const alert = await alertCtrl.create({
            title: strTitle,
            subTitle: strMessage,
            buttons: buttons_Choice,
        });
        alert.present();
        return canLeave;
    }

    /// <summary>
    /// 一瞬だけメッセージボックス表示
    /// </summary>
    /// <param name="strMessage">表示対象</param>
    /// <param name="strPosition">true:表示する false:表示しない</param>
    static IsWaitMsgBoxMoment(
        toastCtrl,
        strMessage,
        strPosition,
        intMilliSecond
    ): any
    {
        //バイブレーション
        navigator.vibrate(intMilliSecond);

        //トースト表示
        let toast = toastCtrl.create({
            message: strMessage,
            duration: intMilliSecond,
            position: strPosition
        });

        toast.onDidDismiss(() => {
            console.log('Dismissed toast');
        });

        toast.present();
    }

    //20180912 ANHLD ADD START
    static isSetFocus(input:any, keyboard?:any){
        setTimeout(() => {
            if (keyboard != null && keyboard != 'undefined') {
                keyboard.show(); // for android
            }

            input.setFocus();
        }, 1000);
    }
    //20180912 ANHLD ADD END

    //20180926 ANHLD ADD START
    /// <summary>
    /// メッセージボックス
    /// </summary>
    /// <param name="strMessage">表示対象</param>
    /// <param name="strTitle">タイトル</param>
    /// <param name="strType"></param>
    /// <returns></returns>
    static IsWaitMessageBox(
        loadingCtrl,
        strMessage,
        isEnable,
        inputFocus?){

        if (isEnable && this.loading == null) {
            this.loading = loadingCtrl.create({
                content: strMessage
            });

            //Max time loading
            setTimeout(() => {
                if (this.loading != null) {
                    this.loading.dismiss();
                }
            }, 60000);

            this.loading.present();
        }
        else if (this.loading != null) {
            this.loading.dismiss();
            this.loading = null;

            if (inputFocus != null) {
                setTimeout(() => {
                    inputFocus.setFocus();
                }, 1000);
            }
        }
    }
    //20180926 ANHLD ADD END
}
