import { Component } from '@angular/core';
//import { SerialPort } from 'web-serial-polyfill';
import { PortOption, Serial } from '../models/serial';
//import { CommonModule } from '@angular/common';
//import { FormsModule } from '@angular/forms';



@Component({
  selector: 'serial-view',
 // standalone: true,
  //imports:[CommonModule, FormsModule],
  templateUrl: './serial-view.component.html',
  styleUrl: './serial-view.component.css'
})
export class SerialViewComponent {
  portCounter: number = 1;
  //@ViewChild('ports') portSelector: ElementRef<HTMLSelectElement> | undefined;
  portOptions: PortOption[] = [];
  serialPorts: Serial[] = [];
  selectedPort: PortOption | undefined;
  port: any;
  name = 'Bascula';
  constructor( ) {
  }
  async ngAfterViewInit() {

   // console.log(this.portSelector!);
   
  }
  addNewPort(port: any ): PortOption | undefined {
    try {
      this.portOptions.push({
        text: `Bascula ${this.portCounter++}`,
        port: port,
        selected: false,
        info: port.getInfo(),
      });
      this.selectedPort = this.portOptions[this.portOptions.length - 1];
      console.log('new port created ' + this.selectedPort.info);
      this.serialPorts.push(new Serial(this.selectedPort, this.dataHandler ) );
      return this.selectedPort;
    } catch (e) {
      console.log(e);
    }

    return undefined;
  }

  maybeAddNewPort(port: any ): PortOption {
    const portOption = this.findPortOption(port);
    if (portOption) {
      console.log('encontrado');
      return portOption;
    }
    return this.addNewPort(port)!;
  }
  findPortOption(port: any ): PortOption | null {
    for (let i = 0; i < this.portOptions.length; ++i) {
      const option = this.portOptions[i];
      const portOption = option as PortOption;
      if (portOption.port === port) {
        return portOption;
      }
    }

    return null;
  }

  dataHandler(data: string) {
    console.log('Bascula1 -> ' + data);
  }
  onChange(event:any){
    //debugger;
  }
  async connect() {
    debugger;
    if(this.selectedPort && !this.selectedPort.serialHandler?.connected){
      await this.selectedPort.serialHandler?.connect(this.dataHandler);
    }
  }

  async close() {
    if(this.selectedPort && this.selectedPort.serialHandler?.connected){
      await this.selectedPort.serialHandler?.close((elem:any)=>{
        debugger;
      });
    }
  }
  

  async getSelectedPort(): Promise<void> {
      try {
        let nav: any = navigator;
        let port = await nav.serial.requestPort();
        const portOption = this.maybeAddNewPort(port);
      
      } catch (e) {
        return;
      }
   
  }
}
