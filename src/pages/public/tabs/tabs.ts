import { Component } from '@angular/core';
import { HomePage } from '../home/home';
import { SearchPage } from '../../private/search/search';
import { LoginPage } from '../login/login';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = HomePage;
  tab2Root: any = SearchPage;
  tab3Root: any = HomePage;
  tab4Root: any = LoginPage;

  constructor() {

  }
}
