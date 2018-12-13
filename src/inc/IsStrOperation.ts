import * as exEncoding from 'encoding-japanese';

export class IsStrOperation {

    static fnc_DirSep_Add(path: string): string {
        var res = "";
        res = path;

        if (res.lastIndexOf('/') != res.length - 1) {
            res = res + '/';
        }
        return res;
    }

    //20181210 ANHLD ADD START
    /// -----------------------------------------------------------------------------------------
    /// <summary>
    ///     半角 1 バイト、全角 2 バイトとして、指定された文字列のバイト数を返します。</summary>
    /// <param name="stTarget">
    ///     バイト数取得の対象となる文字列。</param>
    /// <returns>
    ///     半角 1 バイト、全角 2 バイトでカウントされたバイト数。</returns>
    /// -----------------------------------------------------------------------------------------
    static strlen(stTarget: string ) : any
    {
        var encodeBuffer = new TextEncoder().encode(stTarget);
        var encodeJP = exEncoding.convert(encodeBuffer, "SJIS");
        return encodeJP.length;
    }

    /// <summary>
        /// 前ＺＥＲＯ編集
        /// </summary>
        /// <param name="strTarget">対象変数</param>
        /// <param name="rtnTarget">格納変数</param>
        /// <param name="count">抽出文字数</param>
    static IsStrZero(strTarget: string, intStatus: number): string {
        var strZero = "0".repeat(intStatus - this.strlen(strTarget));
        return strZero + strTarget;
    }
    //20181210 ANHLD ADD END
}
