import { Component } from "@angular/core";
import { NavParams } from 'ionic-angular';

@Component({
    selector:'page-search-detail',
    templateUrl: 'search_detail.html'
})

export class SearchDetailPage {

    private ITEMS_DATA: string[];
    //********************************************************************************
    //コンストラクタ
    //********************************************************************************
    constructor(public navParams: NavParams) {
        if (this.navParams.get('SEARCH_DATA') != null) {
            this.ITEMS_DATA = this.navParams.get('SEARCH_DATA');
        }        
    }   
}