import { Component, OnInit } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, NgForm } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  profileForm = new FormGroup({
    id: new FormControl(''),
    temperature: new FormControl(''),
  });
  public port: any;
  public parser: any;
  public selectedPortId: string = 'COM3';
  public portOpts = { baudRate: 115200, autoOpen: false };
  kristan: any;
  
  

  customerUrl: string = "http://localhost:8888/api/customer/";

  constructor(
    private electronService: ElectronService,
    private translate: TranslateService,
    private http: HttpClient
  ) {
    this.translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);

    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Run in electron');
      console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      console.log('NodeJS childProcess', this.electronService.childProcess);
    } else {
      console.log('Run in browser');
    }
  }
  ngOnInit() {
    this.openSerial();
  }

  openSerial() {
    this.port = new this.electronService.serialPort("COM3", {
      baudRate: 115200,
      });
    this.parser = new this.electronService.readLine();
    this.port.pipe(this.parser);
    this.parser.on("data", (line) => 
    {
      var n = line.toString().indexOf("T body");
      if (n == 0) {
          var string = line.toString();
          var result = string.substring(string.lastIndexOf(".") - 2);
          var sub = result.substring(0,4);
          console.log(sub);
          this.updateProfile(sub);
          // this.temperature = sub;
        }
      }); 
  }
  updateProfile(temperature) {
    this.profileForm.patchValue({
      temperature: temperature
    });
  }

  updateTemperature() {
    // this.lastName.setValue('Nancy');
  }
  save(customer) { 
    // console.log(customer.value);
    // customer.value["temperature"] = "38.5";
    console.log('log')
    console.log(customer.value);
    // this.profileForm.reset(this.profileForm.value);
    this.saveSession(customer.value).subscribe(res => 
      {
        console.log(res);
        customer.reset();
        // this.profileForm.reset(this.profileForm.value);
      })
      customer.reset();
  }

  saveSession(body) {
    return this.http.post(this.customerUrl+'session', body)
  }
}
