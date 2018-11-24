//プラグイン/モジュールなど ---------------------------------------------------------
import { SQLite } from 'ionic-native';
import { Platform } from 'ionic-angular';
import { Global } from '../inc/Global';
 
//HEARTIS関数 -----------------------------------------------------------------------

export class IsIniOperation {

    
    static CreateIniFile() {

        var platform = new Platform;
        var db = new SQLite();

        db.openDatabase({
            name: Global.SETDB,
            location: "default"

        }).then(() => {
            db.executeSql("CREATE TABLE IF NOT EXISTS " + Global.T_SETINI + " (T_KEYNAME TEXT, T_VALUE TEXT)", {})
                .then(data => {
                    console.log("TABLE CREATED: ", data);
                }, error => {
                    alert('Unable to execute sql \n' + error);
                })

        }, error => {
            alert('Unable to open database \n' + error);
        });

        db.close;
    }

    /// <summary>
        /// INIファイル読み込み
        /// </summary>
        /// <param name="filename">ファイル名</param>
        /// <param name="strtarget">キー文字列</param>
        /// <param name="rtntarget">値</param>
        /// <returns></returns>
    static async IsIniRead(filename: string, strtarget: string, rtntarget?: string): Promise<string> {
        var db = new SQLite();
        var strSQL = '';
        var res = '';

        await db.openDatabase({ name: Global.SETDB, location: "default" }).then(async () => {

            strSQL = '';
            strSQL += "SELECT * FROM " + filename + " ";
            strSQL += "WHERE ";
            strSQL += "     T_KEYNAME ='" + strtarget + "' ";
            //Check exits
            await db.executeSql(strSQL, []).then(async (data) => {
                if (data.rows.item(0)== null || data.rows.item(0).T_VALUE == null) { //20180924 ANHLD EDIT
                    res = "";
                }
                else {
                    res = data.rows.item(0).T_VALUE;
                }
            });

        });

        return res;
    }

    /// <summary>
    /// INIファイル書き込み
    /// </summary>
    /// <param name="filename">ファイル名</param>
    /// <param name="strtarget">キー文字列</param>
    /// <param name="rtntarget">値</param>
    /// <returns></returns>
    static async IsIniWrite(filename: string, strtarget: string, rtntarget: string) {

        var db = new SQLite();
        var strSQL = '';

       await db.openDatabase({ name: 'SET.db', location: "default" }).then(async() => {

            strSQL = '';
            strSQL += "SELECT COUNT(*) AS TOTAL FROM " + filename + " ";
            strSQL += "WHERE ";
            strSQL += "     T_KEYNAME ='" + strtarget + "' ";

            //Check exits
           await db.executeSql(strSQL, [])
               .then(async (data) => {

                    //Insert record
                    if (data.rows.item(0).TOTAL == 0) {
                        strSQL = '';
                        strSQL += "INSERT INTO " + filename + " ";
                        strSQL += "( ";
                        strSQL +=   "T_KEYNAME, ";
                        strSQL +=   "T_VALUE ";
                        strSQL += ") ";
                        strSQL += "VALUES ";
                        strSQL += "( ";
                        strSQL +=   "'" + strtarget + "', ";
                        strSQL +=   "'" + rtntarget + "' ";
                        strSQL += ") ";
                    }
                    //Update Record
                    else {
                        strSQL = '';
                        strSQL += "UPDATE " + filename + " ";
                        strSQL += "SET ";
                        strSQL +=   "T_VALUE ='" + rtntarget + "' ";
                        strSQL += "WHERE ";
                        strSQL +=   "T_KEYNAME ='" + strtarget + "' ";
                    }

                   await db.executeSql(strSQL, []);
                });

        }, (error) => {
            alert('エラー' + '\n' + error);
        });

        //Close db
        db.close;
    }
}
