import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler, Platform } from 'ionic-angular'; //20180912 ANHLD ADD [Platform]
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { MyApp } from './app.component';

//共通
import { TabsPage } from '../pages/public/tabs/tabs';
import { HomePage } from '../pages/public/home/home';
import { LoginPage } from '../pages/public/login/login';
import { SettingPage } from '../pages/public/setting/setting';
import { AboutPage } from '../pages/public/about/about';

//個別ページ ---------------------------------------------------------
import { NyukoPage } from '../pages/private/nyuko/nyuko';
import { SyukoPage } from '../pages/private/syuko/syuko';
import { SearchPage } from '../pages/private/search/search';
import { SearchDetailPage } from '../pages/private/search_detail/search_detail'; //20181016 ANHLD ADD

@NgModule({
  declarations: [ //ページを追加したら、ここにも追加することを忘れない
    MyApp,
    TabsPage,
    HomePage,
    SearchPage,
    LoginPage,
    SettingPage,
    AboutPage,
    NyukoPage,
    SyukoPage,
    SearchDetailPage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [  //ページを追加したら、ここにも追加することを忘れない
    MyApp,
    TabsPage,
    HomePage,
    SearchPage,
    LoginPage,
    SettingPage,
    AboutPage,
    NyukoPage,
    SyukoPage,
    SearchDetailPage
  ],
  providers: [
      BarcodeScanner,
      AndroidPermissions,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
