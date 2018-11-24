export class IsStrOperation {

    static fnc_DirSep_Add(path: string): string {
        var res = "";
        res = path;

        if (res.lastIndexOf('/') != res.length - 1) {
            res = res + '/';
        }
        return res;
    }
    
}
