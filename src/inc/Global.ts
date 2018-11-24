export class Global {
    static SETDB: string = "SET.db";
    static T_SETINI: string = "T_SETINI";
    static g_Tanto: string = "";
    static CurrentControl = null;

    //取得情報格納変数
    static GDATA = 
        {
            "Data": [],
            "Cnt": 10,
            "PagePos": 20,
            "CsPos": 30,
            "input_flg_Write": 90
        };
}
export class GDATA {
    public Data: string[][];
    public Cnt: number;
    public MaxPage: number;
    public PagePos: number;
    public CsPos: number;

    constructor() {
        this.Data = [];
        this.Cnt = 0;
        this.MaxPage = 0;
        this.PagePos = 0;
        this.CsPos = 0;
    }
}
