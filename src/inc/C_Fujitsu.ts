import { File } from '@ionic-native/file';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { IsStrOperation } from '../inc/IsStrOperation';
import { Global } from '../inc/Global';
import { IsIniOperation } from './IsIniOperation';
import * as exEncoding from 'encoding-japanese';
import * as exBuffer from 'buffer';

export class C_Fujitsu {
    // 定数宣言
    private static ESC = 0x1B;
    private static FS = 0x1C;
    private static GS = 0x1D;
    private static FF = 0x0C;
    private static SOH = 0x01;
    private static ACK = 0x06;
    private static NAK = 0x15;
    private static CAN = 0x18;
    private static EOT = 0x04;
    private static MAX_LENGTH_PER_LINE = 4 + 255 + 2;
    private static byteData = [];//のちほど配列がリサイズされる

    private static readonly IS_ERROR = -1;
    private static readonly IS_NO_ERROR = 0;

    private static file: File = new File();
    private static bluetoothSerial: BluetoothSerial = new BluetoothSerial();

    /// <summary>
    /// 指定されたファイルのプリンタコマンドを送信する
    /// </summary>
    /// <returns></returns>
    static async prnSendDataSPP(filename: string): Promise<any> {
        var ret = this.IS_NO_ERROR;
        var buff = new Int16Array(255);
        var loop_cnt = 0;
        var isCompletePrint = false;
        var buffData = new Uint8Array(0);

        //ANHLD_TEMP C_Printer.strPrinterLogfileName = DateTime.Now.ToString("yyyyMMdd_HHmmss_") + "PRINTER.BIN";

        //Read data
        var arrayBuffData = await this.fnc_ReadFile(filename);
        buffData = new Uint8Array(arrayBuffData);

        //セレクティング（データリンク確立）--------------------------------------------------
        try {
            //リトライ回数初期化
            loop_cnt = 0;

            buff = new Int16Array(1);
            buff[0] = this.DecimalToByte('C');
            //ret = C_Printer.sub_CommandSend(C_Printer.Connection.BlueTooth, buff, buff.Length);
            ret = await this.sub_CommandSend(buff);

            if (ret < 0) return this.IS_ERROR;

            //ステータス確認
            // 応答待機処理
            while (true) {
                buff = new Int16Array(2);
                //ret = C_Printer.sub_CommandRecv(C_Printer.Connection.BlueTooth, ref buff, 2, 1);	// 2バイト受信(1秒×10回待機)
                buff = await this.sub_CommandRecv();	// 2バイト受信(1秒×10回待機)
                ret = buff.length;

                if (ret == 2) // ２バイト受信完了
                {
                    if (buff[0] == this.ACK)    // 返送ステータス
                    {
                        if (this.sub_CheckPrintStatus(buff[1]) < 0) {
                            return this.IS_ERROR;
                        }
                        break;
                    }
                    else if (buff[0] == this.NAK) //携帯プリンタから否定応答
                    {
                        return this.IS_ERROR;
                    }
                    else if (buff[0] == this.CAN) //プロトコル異状などで受信キャンセル
                    {
                        return this.IS_ERROR;
                    }
                }
                else if (ret == 0) // 受信できなかった
                {
                    loop_cnt++;
                }
                else {  // エラー
                    return this.IS_ERROR;
                }
                if (loop_cnt > 10) // 受信タイム(リトライ)アウト
                {
                    return this.IS_ERROR;
                }
            }
        }
        catch
        {
        }
        //セレクティング（データリンク確立）--------------------------------------------------


        //データ送信 --------------------------------------------------
        // ファイルをオープンする
        end_try: try {
            var intcount = 0;

            // データ送信
            while (true) {
                //リトライ回数初期化
                loop_cnt = 0;
                buff = new Int16Array(1);

                var iCnt = 0;
                var buff2 = new Int16Array(0);

                while (true) {
                    // ファイルからデータを読み込む
                    //=======================================> OLD
                    // //buff = br.ReadBytes(1);
                    // if (buff.length == 0) {
                    //     // 読み込み完了なら終了
                    //     if (buff2.length == 0) {
                    //         ret = 0;
                    //         //goto CompletePrint;
                    //         isCompletePrint = true;
                    //         break end_try;
                    //     }

                    //     //SOH(1) + ﾌﾗｸﾞ(1) + ﾃﾞｰﾀﾌﾞﾛｯｸ番号(1) + ﾃﾞｰﾀ部桁数(1) + データ部(<255) + CRC(2)
                    //     break;
                    // }

                    // //Array.Resize(ref buff2, buff2.Length + 1);
                    // buff2 = this.ResizeInt16Array(buff2, buff2.length + 1);
                    // buff2[buff2.length - 1] = buff[0];

                    // //SOH(1) + ﾌﾗｸﾞ(1) + ﾃﾞｰﾀﾌﾞﾛｯｸ番号(1) + ﾃﾞｰﾀ部桁数(1) + データ部(255) + CRC(2)
                    // if (buff2.length == 1 + 1 + 1 + 1 + 255 + 2) {
                    //     break;
                    // }
                    //<======================================= OLD

                    //=======================================> NEW
                    if (iCnt == buffData.length) {
                        // 読み込み完了なら終了
                        if (buff2.length == 0) {
                            ret = 0;
                            //goto CompletePrint;
                            isCompletePrint = true;
                            break end_try;
                        }

                        //SOH(1) + ﾌﾗｸﾞ(1) + ﾃﾞｰﾀﾌﾞﾛｯｸ番号(1) + ﾃﾞｰﾀ部桁数(1) + データ部(<255) + CRC(2)
                        break;
                    }

                    buff[0] = buffData[iCnt];

                    //Array.Resize(ref buff2, buff2.Length + 1);
                    buff2 = this.ResizeInt16Array(buff2, buff2.length + 1);
                    buff2[buff2.length - 1] = buff[0];

                    //SOH(1) + ﾌﾗｸﾞ(1) + ﾃﾞｰﾀﾌﾞﾛｯｸ番号(1) + ﾃﾞｰﾀ部桁数(1) + データ部(255) + CRC(2)
                    if (buff2.length == 1 + 1 + 1 + 1 + 255 + 2) {
                        break;
                    }

                    iCnt++;
                    //<======================================= NEW
                }

                // 送信
                //ret = C_Printer.sub_CommandSend(C_Printer.Connection.BlueTooth, buff2, buff2.Length);
                ret = await this.sub_CommandSend(buff2);

                if (ret < 0) return this.IS_ERROR;

                //ステータス確認
                // 応答待機処理
                while (true) {
                    buff = new Int16Array(2);
                    //ret = C_Printer.sub_CommandRecv(C_Printer.Connection.BlueTooth, ref buff, 2, 1);	// 2バイト受信(1秒×10回待機)
                    buff = await this.sub_CommandRecv();	// 2バイト受信(1秒×10回待機)
                    ret = buff.length;

                    if (ret == 2) // ２バイト受信完了
                    {
                        if (buff[0] == this.ACK)    // 返送ステータス
                        {
                            if (this.sub_CheckPrintStatus(buff[1]) < 0) {
                                return this.IS_ERROR;
                            }
                            break;
                        }
                        else if (buff[0] == this.NAK) {
                            //携帯プリンタから否定応答
                            return this.IS_ERROR;
                        }
                        else if (buff[0] == this.CAN) {
                            //プロトコル異状などで受信キャンセル
                            return this.IS_ERROR;
                        }
                    }
                    else if (ret == 0) {
                        // 受信できなかった
                        loop_cnt++;

                        //2018/03/14 murakami Ver0.7.5 EDIT --------------------------------------------
                        //10回と5回のIF文の位置を入れ替え
                        if (loop_cnt > 10) {
                            // 受信タイム(リトライ)アウト
                            return this.IS_ERROR;
                        }
                        //5回を超えたらWaitを入れる
                        else if (loop_cnt > 5) {
                            await this.ThreadSleep(3000);
                            continue;
                        }
                        //2018/03/14 murakami Ver0.7.5 EDIT --------------------------------------------
                    }
                    else {  // エラー
                        return this.IS_ERROR;
                    }
                }

                await this.ThreadSleep(1000);
            }
        }
        catch (err) {
            ret = -1;
        }
        finally {
            //br.Close();
            //fs.Close();
            //sr.Close();
        }
        //データ送信 --------------------------------------------------

        if (isCompletePrint) {
            //接続解除 --------------------------------------------------
            try {
                //リトライ回数初期化
                loop_cnt = 0;

                buff = new Int16Array(1);
                buff[0] = this.EOT;
                //ret = C_Printer.sub_CommandSend(C_Printer.Connection.BlueTooth, buff, buff.Length);
                ret = await this.sub_CommandSend(buff);

                if (ret < 0) return this.IS_ERROR;

                //ステータス確認
                // 応答待機処理
                while (true) {
                    buff = new Int16Array(2);
                    //ret = C_Printer.sub_CommandRecv(C_Printer.Connection.BlueTooth, ref buff, 2, 1);	// 2バイト受信(1秒×10回待機)
                    buff = await this.sub_CommandRecv();	// 2バイト受信(1秒×10回待機)
                    ret = buff.length;

                    if (ret == 2) // ２バイト受信完了
                    {
                        if (buff[0] == this.ACK)    // 返送ステータス
                        {
                            if (this.sub_CheckPrintStatus(buff[1]) < 0) {
                                return this.IS_ERROR;
                            }
                            break;
                        }
                        else if (buff[0] == this.NAK) //携帯プリンタから否定応答
                        {
                            return this.IS_ERROR;
                        }
                        else if (buff[0] == this.CAN) //プロトコル異状などで受信キャンセル
                        {
                            return this.IS_ERROR;
                        }
                    }
                    else if (ret == 0) { // 受信できなかった
                        loop_cnt++;
                    }
                    else {  // エラー
                        return this.IS_ERROR;
                    }
                    if (loop_cnt > 10) // 受信タイム(リトライ)アウト
                    {
                        return this.IS_ERROR;
                    }
                }
            }
            catch
            {

            }
            //接続解除 --------------------------------------------------
        }
        End:
        try {
            //br.Close();
            //fs.Close();
        }
        catch { }

        return ret;
    }

    /// <summary>
    /// ラベル印刷レイアウト
    /// </summary>
    static async MakeCommandFile(filename: string) {

        var byteSendData = new Uint16Array(4 + 255 + 2);            //SOH(1) + フラグ(1) + データブロック番号(1) + データ部桁数(1) + １ブロックあたりのデータ部最大桁数(255) + CRC(2)
        var byteSendDataWork = new Uint16Array(255 + 2);            //データブロック番号(1) + データ部桁数(1) + １ブロックあたりのデータ部最大桁数(255)
        var blnFractionBlock = false;
        var intFractionBlockSize = 0;
        var crc = 0;
        var len = 0;
        var intMaxDataNo;
        var isReplace = true;
        this.byteData = [];                                         //のちほど配列がリサイズされる

        //初期化
        len = 0;

        //ファイル削除
        //IsFileOperation.Remove(filename);

        try {

            //↓ページ設定----------------------------------
            //初期化
            this.BytesAppendByte(this.byteData, this.ESC);
            this.BytesAppendString(this.byteData, "@");

            //漢字印字開始設定
            this.BytesAppendByte(this.byteData, this.FS);
            this.BytesAppendString(this.byteData, "&");

            //漢字コード体系選択 
            this.BytesAppendByte(this.byteData, this.FS);
            this.BytesAppendString(this.byteData, "C");
            this.BytesAppendByte(this.byteData, 0x01);

            //ページ印字モード指定
            this.BytesAppendByte(this.byteData, this.ESC);
            this.BytesAppendString(this.byteData, "L");

            //ページ印字モード印字領域設定
            this.BytesAppendByte(this.byteData, this.ESC);
            this.BytesAppendString(this.byteData, "W");
            this.BytesAppendByte(this.byteData, 0x00);     //X1
            this.BytesAppendByte(this.byteData, 0x00);     //X2
            this.BytesAppendByte(this.byteData, 0x00);     //Y1
            this.BytesAppendByte(this.byteData, 0x00);     //Y2
            this.BytesAppendByte(this.byteData, 100);      //dX1
            this.BytesAppendByte(this.byteData, 2);        //dX2
            this.BytesAppendByte(this.byteData, 111);      //dY1
            this.BytesAppendByte(this.byteData, 1);        //dY2
            //↑ページ設定----------------------------------

            //↓ロゴ----------------------------------
            //ページ印字モード縦方向絶対位置指定
            this.BytesAppendByte(this.byteData, this.GS);
            this.BytesAppendString(this.byteData, "$");
            this.BytesAppendByte(this.byteData, 0x38);     //n1
            this.BytesAppendByte(this.byteData, 0x00);     //n2

            //印字横方向絶対位置指定
            this.BytesAppendByte(this.byteData, this.ESC);
            this.BytesAppendString(this.byteData, "$");
            this.BytesAppendByte(this.byteData, 0xB0);     //n1
            this.BytesAppendByte(this.byteData, 0x01);     //n2

            //登録イメージ印字
            this.BytesAppendByte(this.byteData, this.GS);
            this.BytesAppendString(this.byteData, "'");
            this.BytesAppendByte(this.byteData, 0x01);     //ID 番号
            this.BytesAppendByte(this.byteData, 0x00);     //印字モード 0:等倍 1:横倍 2:縦倍 3:４倍
            //↑ロゴ----------------------------------

            //↓近鉄ロジスティクス・システムズ----------------------------------
            //ページ印字モード縦方向絶対位置指定
            this.BytesAppendByte(this.byteData, this.GS);
            this.BytesAppendString(this.byteData, "$");
            this.BytesAppendByte(this.byteData, 0x18);     //n1
            this.BytesAppendByte(this.byteData, 0x00);     //n2

            //印字横方向絶対位置指定
            this.BytesAppendByte(this.byteData, this.ESC);
            this.BytesAppendString(this.byteData, "$");
            this.BytesAppendByte(this.byteData, 0x00);     //n1
            this.BytesAppendByte(this.byteData, 0x00);     //n2

            //印字データ
            this.BytesAppendString(this.byteData, "近鉄ロジスティクス・システムズ");
            //↑近鉄ロジスティクス・システムズ----------------------------------

            //↓「営業所：」（タイトル）----------------------------------
            //ページ印字モード縦方向絶対位置指定
            this.BytesAppendByte(this.byteData, this.GS);
            this.BytesAppendString(this.byteData, "$");
            this.BytesAppendByte(this.byteData, 0x50);     //n1
            this.BytesAppendByte(this.byteData, 0x00);     //n2

            //印字横方向絶対位置指定
            this.BytesAppendByte(this.byteData, this.ESC);
            this.BytesAppendString(this.byteData, "$");
            this.BytesAppendByte(this.byteData, 0x10);     //n1
            this.BytesAppendByte(this.byteData, 0x00);     //n2

            //印字データ
            this.BytesAppendString(this.byteData, "営業所：");
            //↑「営業所：」（タイトル）----------------------------------

            //↓営業所バーコード----------------------------------
            //ページ印字モード縦方向絶対位置指定
            this.BytesAppendByte(this.byteData, this.GS);
            this.BytesAppendString(this.byteData, "$");
            this.BytesAppendByte(this.byteData, 0x60);     //n1
            this.BytesAppendByte(this.byteData, 0x00);     //n2

            //バーコード横サイズ設定 
            this.BytesAppendByte(this.byteData, this.GS);
            this.BytesAppendString(this.byteData, "e");
            this.BytesAppendByte(this.byteData, 0x03);     //m
            this.BytesAppendByte(this.byteData, 0x06);     //n

            //バーコード高さ設定
            this.BytesAppendByte(this.byteData, this.GS);
            this.BytesAppendString(this.byteData, "h");
            this.BytesAppendByte(this.byteData, 60);       //n

            //一次元バーコード印字
            var ShopNo = "030";
            this.BytesAppendByte(this.byteData, this.GS);
            this.BytesAppendString(this.byteData, "k");
            this.BytesAppendByte(this.byteData, 71);                          //m コード設定　NW-7
            this.BytesAppendByte(this.byteData, this.DecimalToByte(ShopNo.length + 2));   //n
            //印字データ
            this.BytesAppendString(this.byteData, "a");
            this.BytesAppendString(this.byteData, ShopNo);
            this.BytesAppendString(this.byteData, "a");
            //↑営業所バーコード----------------------------------

            //↓営業所コード（ヒューマンリーダブル）----------------------------------
            //ページ印字モード縦方向絶対位置指定
            this.BytesAppendByte(this.byteData, this.GS);
            this.BytesAppendString(this.byteData, "$");
            this.BytesAppendByte(this.byteData, 0x78);     //n1
            this.BytesAppendByte(this.byteData, 0x00);     //n2

            //印字横方向絶対位置指定
            this.BytesAppendByte(this.byteData, this.ESC);
            this.BytesAppendString(this.byteData, "$");
            this.BytesAppendByte(this.byteData, 0xB0);     //n1
            this.BytesAppendByte(this.byteData, 0x00);     //n2

            //印字データ
            this.BytesAppendString(this.byteData, ShopNo);
            //↑営業所コード（ヒューマンリーダブル）----------------------------------

            //↓営業所名称----------------------------------
            var ShopName = "岡崎営業所";
            //ページ印字モード縦方向絶対位置指定
            this.BytesAppendByte(this.byteData, this.GS);
            this.BytesAppendString(this.byteData, "$");
            this.BytesAppendByte(this.byteData, 0x50);     //n1
            this.BytesAppendByte(this.byteData, 0x00);     //n2

            //印字横方向絶対位置指定
            this.BytesAppendByte(this.byteData, this.ESC);
            this.BytesAppendString(this.byteData, "$");
            this.BytesAppendByte(this.byteData, 0x60);     //n1
            this.BytesAppendByte(this.byteData, 0x01);     //n2

            //印字データ
            this.BytesAppendString(this.byteData, ShopName);
            //↑営業所名称----------------------------------

            //↓「従業員：」（タイトル）----------------------------------
            //ページ印字モード縦方向絶対位置指定
            this.BytesAppendByte(this.byteData, this.GS);
            this.BytesAppendString(this.byteData, "$");
            this.BytesAppendByte(this.byteData, 0xBA);     //n1
            this.BytesAppendByte(this.byteData, 0x00);     //n2

            //印字横方向絶対位置指定
            this.BytesAppendByte(this.byteData, this.ESC);
            this.BytesAppendString(this.byteData, "$");
            this.BytesAppendByte(this.byteData, 0x10);     //n1
            this.BytesAppendByte(this.byteData, 0x00);     //n2

            //印字データ
            this.BytesAppendString(this.byteData, "従業員：");
            //↑「従業員：」（タイトル）----------------------------------

            //↓従業員バーコード----------------------------------
            //ページ印字モード縦方向絶対位置指定
            this.BytesAppendByte(this.byteData, this.GS);
            this.BytesAppendString(this.byteData, "$");
            this.BytesAppendByte(this.byteData, 0xC2);     //n1
            this.BytesAppendByte(this.byteData, 0x00);     //n2

            //バーコード横サイズ設定 
            this.BytesAppendByte(this.byteData, this.GS);
            this.BytesAppendString(this.byteData, "e");
            this.BytesAppendByte(this.byteData, 0x03);     //m
            this.BytesAppendByte(this.byteData, 0x06);     //n

            //バーコード高さ設定
            this.BytesAppendByte(this.byteData, this.GS);
            this.BytesAppendString(this.byteData, "h");
            this.BytesAppendByte(this.byteData, 60);       //n

            //一次元バーコード印字
            var strPic = "0301001";
            this.BytesAppendByte(this.byteData, this.GS);
            this.BytesAppendString(this.byteData, "k");
            this.BytesAppendByte(this.byteData, 71);                          //m コード設定　NW-7
            this.BytesAppendByte(this.byteData, this.DecimalToByte(strPic.length + 2));   //n
            //印字データ
            this.BytesAppendString(this.byteData, "a");
            this.BytesAppendString(this.byteData, strPic);
            this.BytesAppendString(this.byteData, "a");
            //↑従業員バーコード----------------------------------

            //↓従業員コード（ヒューマンリーダブル）----------------------------------
            //ページ印字モード縦方向絶対位置指定
            this.BytesAppendByte(this.byteData, this.GS);
            this.BytesAppendString(this.byteData, "$");
            this.BytesAppendByte(this.byteData, 0xDA);     //n1
            this.BytesAppendByte(this.byteData, 0x00);     //n2

            //印字横方向絶対位置指定
            this.BytesAppendByte(this.byteData, this.ESC);
            this.BytesAppendString(this.byteData, "$");
            this.BytesAppendByte(this.byteData, 0xB0);     //n1
            this.BytesAppendByte(this.byteData, 0x00);     //n2

            //印字データ
            this.BytesAppendString(this.byteData, strPic);
            //↑従業員コード（ヒューマンリーダブル）----------------------------------

            //↓従業員名称----------------------------------
            var strPicName = "平田０００１";
            //ページ印字モード縦方向絶対位置指定
            this.BytesAppendByte(this.byteData, this.GS);
            this.BytesAppendString(this.byteData, "$");
            this.BytesAppendByte(this.byteData, 0xDA);     //n1
            this.BytesAppendByte(this.byteData, 0x00);     //n2

            //印字横方向絶対位置指定
            this.BytesAppendByte(this.byteData, this.ESC);
            this.BytesAppendString(this.byteData, "$");
            this.BytesAppendByte(this.byteData, 0x60);     //n1
            this.BytesAppendByte(this.byteData, 0x01);     //n2

            //印字データ
            this.BytesAppendString(this.byteData, strPicName);
            //↑従業員名称----------------------------------

            //↓「車　番：」（タイトル）----------------------------------
            var CarNo = "12345";
            //車番が入力された場合のみ印字する
            if (CarNo != "") {
                //ページ印字モード縦方向絶対位置指定
                this.BytesAppendByte(this.byteData, this.GS);
                this.BytesAppendString(this.byteData, "$");
                this.BytesAppendByte(this.byteData, 0x15);     //n1
                this.BytesAppendByte(this.byteData, 0x01);     //n2

                //印字横方向絶対位置指定
                this.BytesAppendByte(this.byteData, this.ESC);
                this.BytesAppendString(this.byteData, "$");
                this.BytesAppendByte(this.byteData, 0x10);     //n1
                this.BytesAppendByte(this.byteData, 0x00);     //n2

                //印字データ
                this.BytesAppendString(this.byteData, "車　番：");
            }
            //↑「車　番：」（タイトル）----------------------------------

            //↓車番バーコード----------------------------------
            //車番が入力された場合のみ印字する
            if (CarNo != "") {
                //ページ印字モード縦方向絶対位置指定
                this.BytesAppendByte(this.byteData, this.GS);
                this.BytesAppendString(this.byteData, "$");
                this.BytesAppendByte(this.byteData, 0x25);     //n1
                this.BytesAppendByte(this.byteData, 0x01);     //n2

                //バーコード横サイズ設定 
                this.BytesAppendByte(this.byteData, this.GS);
                this.BytesAppendString(this.byteData, "e");
                this.BytesAppendByte(this.byteData, 0x03);     //m
                this.BytesAppendByte(this.byteData, 0x06);     //n

                //バーコード高さ設定
                this.BytesAppendByte(this.byteData, this.GS);
                this.BytesAppendString(this.byteData, "h");
                this.BytesAppendByte(this.byteData, 60);       //n

                //一次元バーコード印字
                this.BytesAppendByte(this.byteData, this.GS);
                this.BytesAppendString(this.byteData, "k");
                this.BytesAppendByte(this.byteData, 71);                          //m コード設定　NW-7
                this.BytesAppendByte(this.byteData, this.DecimalToByte(CarNo.length + 2));   //n
                //印字データ
                this.BytesAppendString(this.byteData, "a");
                this.BytesAppendString(this.byteData, CarNo);
                this.BytesAppendString(this.byteData, "a");
            }
            //↑車番バーコード----------------------------------

            //↓車番コード（ヒューマンリーダブル）----------------------------------
            //車番が入力された場合のみ印字する
            if (CarNo != "") {
                //ページ印字モード縦方向絶対位置指定
                this.BytesAppendByte(this.byteData, this.GS);
                this.BytesAppendString(this.byteData, "$");
                this.BytesAppendByte(this.byteData, 0x3D);     //n1
                this.BytesAppendByte(this.byteData, 0x01);     //n2

                //印字横方向絶対位置指定
                this.BytesAppendByte(this.byteData, this.ESC);
                this.BytesAppendString(this.byteData, "$");
                this.BytesAppendByte(this.byteData, 0xB0);     //n1
                this.BytesAppendByte(this.byteData, 0x00);     //n2

                //印字データ
                this.BytesAppendString(this.byteData, CarNo);
            }
            //↑車番コード（ヒューマンリーダブル）----------------------------------

            //↓印刷 -----------------------------------------------
            //改頁
            this.BytesAppendByte(this.byteData, this.FF);

            //マーク検出実行
            this.BytesAppendByte(this.byteData, this.GS);
            this.BytesAppendString(this.byteData, "<");
            //↑印刷 -----------------------------------------------

            //書き込み用データ生成 ---------------------------------------------
            len = this.byteData.length;

            //１ブロックのデータ部は255byteなので、データ数を計算する
            intMaxDataNo = len / 255;
            intMaxDataNo = parseInt(intMaxDataNo);

            //あまりがあればもう１ブロック必要
            if ((len % 255) > 0) {
                intFractionBlockSize = len % 255;
                blnFractionBlock = true;
            }

            //255バイトのブロック
            for (var i = 0; i < intMaxDataNo; i++) {
                byteSendData[0] = this.SOH;
                byteSendData[1] = 0x00;             //印字データフラグ
                byteSendData[2] = this.DecimalToByte(i + 1);    //ブロック番号
                byteSendData[3] = 255;              //データ部桁数
                for (var j = 0; j < 255; j++) {
                    byteSendData[4 + j] = this.byteData[i * 255 + j];
                }
                for (var j = 0; j < 2 + 255; j++) {
                    byteSendDataWork[j] = byteSendData[2 + j];
                }

                crc = this.CalcCRC(byteSendDataWork, 255 + 2);
                byteSendData[4 + 255] = (crc & 0xff);
                byteSendData[4 + 255 + 1] = (crc >> 8);

                //bw.Write(byteSendData, 0, 4 + 255 + 2);
                byteSendData = byteSendData.slice(0, 4 + 255 + 2);
                //isReplace:true => If not exist file, create new file.
                await this.fnc_WriteToFile(filename, byteSendData, isReplace);
                isReplace = false;
                //2018/06/27 murakami Ver0.8.2 DELETE ------------------------------
                //bw.Write('\r'); //１ブロックの識別用セパレータ
                //bw.Write('\n'); //１ブロックの識別用セパレータ
                //2018/06/27 murakami Ver0.8.2 DELETE ------------------------------
            }

            //端数サイズ(<255)ブロック
            if (blnFractionBlock) {
                byteSendData[0] = this.SOH;
                byteSendData[1] = 0x00;                         //印字データフラグ
                byteSendData[2] = this.DecimalToByte(intMaxDataNo + 1);     //ブロック番号
                byteSendData[3] = this.DecimalToByte(intFractionBlockSize);   //データ部桁数

                for (var j = 0; j < intFractionBlockSize; j++) {
                    byteSendData[4 + j] = this.byteData[intMaxDataNo * 255 + j];
                }
                for (var j = 0; j < 2 + intFractionBlockSize; j++) {
                    byteSendDataWork[j] = byteSendData[2 + j];
                }

                crc = this.CalcCRC(byteSendDataWork, intFractionBlockSize + 2);
                byteSendData[4 + intFractionBlockSize] = this.DecimalToByte(crc & 0xff);
                byteSendData[4 + intFractionBlockSize + 1] = this.DecimalToByte(crc >> 8);

                //bw.Write(byteSendData, 0, 4 + intFractionBlockSize + 2);
                byteSendData = byteSendData.slice(0, 4 + intFractionBlockSize + 2);
                //isReplace:true => If not exist file, create new file.
                await this.fnc_WriteToFile(filename, byteSendData, isReplace);
                isReplace = false;
                //2018/06/27 murakami Ver0.8.2 DELETE ------------------------------
                //bw.Write('\r'); //１ブロックの識別用セパレータ
                //bw.Write('\n'); //１ブロックの識別用セパレータ
                //2018/06/27 murakami Ver0.8.2 DELETE ------------------------------
            }

            //bw.Close();
            //fs.Close();

        } catch (error) {
            console.log(error);
            return;
        }

        //console.log(this.byteData);
    }

    static sub_CheckPrintStatus(intStatus: any): any {

        var ret = this.IS_ERROR;

        //数値をbitに変換する
        var strStatus = intStatus.toString(2);
        strStatus = IsStrOperation.IsStrZero(strStatus, 8);

        var strBitValue = [];
        strBitValue.push(strStatus.substring(7, 1));
        strBitValue[1] = strStatus.substring(6, 1);
        strBitValue[2] = strStatus.substring(5, 1);
        strBitValue[3] = strStatus.substring(4, 1);
        strBitValue[4] = strStatus.substring(3, 1);
        strBitValue[5] = strStatus.substring(2, 1);
        strBitValue[6] = strStatus.substring(1, 1);
        strBitValue[7] = strStatus.substring(0, 1);

        switch (intStatus) {
            //正常 ------------------------------------------------------------
            case 0:
                ret = this.IS_NO_ERROR;
                break;

            //異常 ------------------------------------------------------------
            default:
                if (strBitValue[6] == "0") {
                    //エラーなし
                    ret = this.IS_NO_ERROR;
                    break;
                }
                else {
                    if (strBitValue[5] != "0")  //カバーオープン検出
                    {
                        alert("カバーオープン検出");
                        break;
                    }
                    if (strBitValue[4] != "0")  //用紙なし検出
                    {
                        alert("用紙なし検出");
                        break;
                    }
                    if (strBitValue[7] != "0")  //プリンタビジー
                    {
                        alert("プリンタビジー");
                        break;
                    }
                    if (strBitValue[2] != "0")  //パワーアラーム
                    {
                        alert("パワーアラーム");
                        break;
                    }
                    if (strBitValue[0] != "0")  //MCU異状検出
                    {
                        alert("MCU異状検出");
                        break;
                    }
                    if (strBitValue[1] != "0")  //プリンタヘッド温度異常
                    {
                        alert("プリンタヘッド温度異常");
                        break;
                    }
                    if (strBitValue[3] != "0")  //バッテリアラーム
                    {
                        alert("バッテリアラーム");
                        break;
                    }
                }
                break;
        }
        return ret;
    }

    /// <summary>
    /// Send data to device.
    /// </summary>
    /// <returns></returns>
    static async sub_CommandSend(dataSend: any): Promise<any> {
        const canLeave = new Promise<any>((resolve, reject) => {
            // Send data to device
            this.bluetoothSerial.write(dataSend).then(
                isSend => {
                    alert("Send data" + isSend); //Send data OK
                    resolve(this.IS_NO_ERROR);
                },
                error => {
                    alert(JSON.stringify(error));
                    resolve(this.IS_ERROR);
                }
            );
        });

        return canLeave;
    }

    /// <summary>
    /// Receive data to device.
    /// </summary>
    /// <returns></returns>
    static async sub_CommandRecv(): Promise<any> {
        const canLeave = new Promise<any>((resolve, reject) => {
            // Send data to device
            this.bluetoothSerial.read().then(
                data => {
                    alert("Recv data" + JSON.stringify(data)); //Recv data OK
                    resolve(data);
                },
                error => {
                    alert(JSON.stringify(error));
                    resolve([]);
                }
            );
        });

        return canLeave;
    }

    /// <summary>
    /// 説明		:	CRCの計算 data:データ	len:データ長
    //	CRC-CCITT
    //	多項式: x^16 + x^12 + x^5 + 1 (0x8408)
    //	初期値: 0xffff
    //	RFC1171 (PPP protocol) 、IrDA IrLAP 1.1
    /// </summary>
    /// <param name="bytes"></param>
    /// <param name="len"></param>
    /// <returns></returns>
    static CalcCRC(bytes, len: any): any {
        var tmp;
        var crc = 0xFFFF;
        for (var i = 0; i < len; i++) {
            tmp = bytes[i];
            tmp ^= this.DecimalToByte(crc & 0xFF);
            tmp ^= this.DecimalToByte(tmp << 4);
            crc = ((tmp << 8) | crc >> 8) ^ this.DecimalToByte(tmp >> 4) ^ (tmp << 3);
        }
        return (0xFFFF - (crc & 0xFFFF));
    }

    /// <summary>
    /// byte型配列<->byte型結合
    /// </summary>
    /// <param name="bytes"></param>
    /// <param name="byteData"></param>
    static BytesAppendByte(bytes, byteData: any) {
        this.byteData.push(byteData);
    }

    /// <summary>
    /// byte型配列<->文字列型結合
    /// </summary>
    /// <param name="bytes"></param>
    /// <param name="strData"></param>
    static BytesAppendString(bytes, byteData: any) {
        var encodeBuffer = new TextEncoder().encode(byteData);
        var encodeJP = exEncoding.convert(encodeBuffer, "SJIS");
        this.byteData = bytes.concat(encodeJP);
    }

    static fnc_WriteToFile(strFileName: string, targetData: any, isReplace?: boolean): Promise<any> {

        var options = {};

        if (isReplace != null && isReplace != undefined) {
            //isReplace:true => If not exist file, create new file.
            options = { append: !isReplace, replace: isReplace };
        }

        //Convert data to Buffer
        var buffData = exBuffer.Buffer.from(targetData).buffer;

        var canLeave = new Promise<string>((resolve, reject) => {
            this.file.writeFile(this.file.externalDataDirectory, strFileName, buffData, options).then(
                (data) => {
                    console.log("createFile_ok" + data);
                    resolve();
                },
                (error) => {
                    console.error("createFile_error" + error);
                    resolve();
                });
        });

        return canLeave;
    }

    static fnc_ReadFile(strFileName: string): Promise<ArrayBuffer> {

        var canLeave = new Promise<ArrayBuffer>((resolve, reject) => {
            this.file.readAsArrayBuffer(this.file.externalDataDirectory, strFileName).then(
                (data) => {
                    console.log("readAsBinaryString" + JSON.stringify(data));
                    resolve(data);
                },
                (error) => {
                    console.error("readAsBinaryString" + error);
                    alert("readAsBinaryString" + error);
                    resolve(null);
                });
        });

        return canLeave;
    }

    static ThreadSleep(timeout: number): Promise<any> {
        const canLeave = new Promise<any>(
            (resolve, reject) => {
                setTimeout(() => {
                    resolve();
                }, timeout);
            }
        );

        return canLeave;
    }

    static ResizeInt16Array(buffer: any, length: any): any {
        var bufferNew = new Int16Array(length);
        bufferNew.set(buffer, 0);

        return bufferNew;
    }

    static DecimalToByte(value: any): any {
        return (value & 255)
    }
}
