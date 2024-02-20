

export interface PortOption {
  port: any ;
  text: string;
  selected: boolean;
  info?: { usbVendorId: number };
  serialHandler?: Serial;
} 
export class Serial {
  private port: any;
  public options = {
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    bufferSize: 256,
    flowControl: 'none',
  }; //Default
  private writer: any;
  private readFunction: Function;
  private controlCharacter: string = '\n';
  private reader: any;
  private readableStreamClosed: any;
  private writableStreamClosed: any;
  private keepReading: boolean = true;
  public connected:boolean=false;

  constructor(private portOption: PortOption, readFunction: Function, options?: any, controlCharacter?: any) {
    this.readFunction = readFunction;
    if (options) this.options = options;
    if (controlCharacter) this.controlCharacter = controlCharacter;
    this.portOption.serialHandler=this;
  }
  public async sendData(data: string) {
    await this.writer.write(data);
  }

  private async readLoop() {
    while (this.port.readable && this.keepReading) {
      const textDecoder = new TextDecoderStream();
      this.readableStreamClosed = this.port.readable.pipeTo(
        textDecoder.writable
      );
      this.reader = textDecoder.readable
        .pipeThrough(
          new TransformStream(new LineBreakTransformer(this.controlCharacter))
        )
        .getReader();

      try {
        while (true) {
          const { value, done } = await this.reader.read();
          if (done) {
            break;
          }
          if (value) {
            this.readFunction(value);
          }
        }
      } catch (error) {
        console.error(
          'Read Loop error. Have the serial device been disconnected ? '
        );
      }
    }
  }
  public async close(callback: Function) {
    this.keepReading = false;
    this.reader.cancel();
    await this.readableStreamClosed.catch(() => {});
    this.writer.close();
    await this.writableStreamClosed;
    await this.port.close();
    this.connected=false;
    callback(null);
  }

  public async connect( callback: Function) {
      this.keepReading = true;
        //const filters = [{ usbVendorId: 4292, usbProductId: 60000 }];
      try {
        this.port =this.portOption.port;
      } catch (error) {
        console.error('Requesting port error: ' + error);
        return;
      }

      try {
        await this.port.open(this.options);
        this.connected=true;
      } catch (error) {
        console.error('Opening port error: ' + error);
        return;
      }

      const textEncoder = new TextEncoderStream();
      this.writableStreamClosed = textEncoder.readable.pipeTo(
        this.port.writable
      );
      this.writer = textEncoder.writable.getWriter();

      this.readLoop();

      callback(this.port);
  }
}

class LineBreakTransformer {
  container: any = '';
  private controlCharacter: string;

  constructor(controlCharacter: string) {
    this.container = '';
    this.controlCharacter = controlCharacter;
  }

  transform(chunk: any, controller: any) {
    this.container += chunk;
    const lines = this.container.split(this.controlCharacter);
    this.container = lines.pop();
    lines.forEach((line: any) => controller.enqueue(line));
  }

  flush(controller: any) {
    controller.enqueue(this.container);
  }
}
