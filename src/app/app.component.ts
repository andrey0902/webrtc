import {Component, OnInit} from '@angular/core';
const recordedChunks = [];
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public video;
  public constraints = {
    video: true,
    audio: true,
    width: { ideal: 400, max: 640 },
    height: { max: 400, ideal: 200 },
    aspectRatio: 1.777777778,
    frameRate: { max: 30, ideal: 15 },
    facingMode: { exact: 'user' },
  };
  public runStream = true;
  public stream;
  public stream2;
  public replay = false;
  public recorder;
  public options;
  public refreshIntervalId;
  public ngOnInit(): void {
    // setTimeout(() => {
    //     const fiveMinutes = 5;
    //     const display = document.querySelector('#time');
    //     console.log('display', display);
    //     this.startTimer(fiveMinutes, display);
    //     this.test();
    // }, 50);

    console.log('Let\'s get this party started', navigator.mediaDevices);
    if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
      console.log('Let\'s get this party started');
    }
    this.handleSuccess = this.handleSuccess.bind(this);
  }

  run(): void {
    if (!this.runStream) {
      this.runStream = true;
    }
    const display = document.querySelector('#time');
    this.startTimer(60, display);
    this.video = document.querySelector('#screenshot video');
    navigator.mediaDevices.getUserMedia(this.constraints).then(this.handleSuccess).catch(this.handleError);
  }

  startRecording(stream): void {
    // @ts-ignore
    if (window.MediaRecorder?.isTypeSupported('video/webm;codecs=vp9')) {
      this.options = { mimeType: 'video/webm; codecs=vp9' };
    } else {
      // @ts-ignore
      if (window.MediaRecorder?.isTypeSupported('video/webm;codecs=vp8')) {
        this.options = { mimeType: 'video/webm; codecs=vp8' };
      } else {
      }
    }
    // @ts-ignore
    if (window.MediaRecorder?.isTypeSupported('video/mp4')) {
      this.options = { mimeType: 'video/mp4' };
    }

    // @ts-ignore
    this.recorder = new MediaRecorder(stream);
    this.recorder.ondataavailable = this.handleDataAvailable;
    this.recorder.start();
  }

  handleSuccess(stream): void {
    console.log(stream);
    this.video.srcObject = stream;
    this.stream = stream;
    this.startRecording(stream);
  }

  handleError(error): void {
    console.error('Error: ', error);
  }

  public stop(): void {
    console.log('stop', this.stream);
    console.log('recorder', this.recorder);
    clearInterval(this.refreshIntervalId);
    this.video.pause();
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        console.log('track.stop', track);
        track.stop();
      });
    }
  }

  handleDataAvailable(event): void {
    console.log('handleDataAvailable size', event);
    recordedChunks.push(event.data);
  }

  play(): void {
    const video: any = document.querySelector('.aa');
    const blob: any = new Blob(recordedChunks, this.options);

    if ('srcObject' in video) {
      try {
        video.srcObject = blob;
      } catch (err) {
        // tslint:disable-next-line:triple-equals
        if (err.name != 'TypeError') {
          throw err;
        }
        // Even if they do, they may only support MediaStream
        video.src = URL.createObjectURL(blob);
      }
    } else {
      video.src = URL.createObjectURL(blob);
    }
  }

  update(stream): void {
    document.querySelector('video').src = stream.url;
  }

  startTimer(duration: any, display): void {
    let timer: any = duration;
    let minutes;
    let seconds;
    this.refreshIntervalId = setInterval(() => {
      minutes = parseInt((timer / 60) as any, 10);
      seconds = parseInt((timer % 60) as any, 10);

      // minutes = minutes < 10 ? '0' + minutes : minutes;
      // seconds = seconds < 10 ? '0' + seconds : seconds;

      display.textContent = minutes + ':' + seconds;
      if (minutes <= 0 && seconds <= 0) {
        clearInterval(this.refreshIntervalId);
        this.stop();
        setTimeout(() => {
          this.play();
          this.replay = !this.replay;
        }, 500);
      }
      --timer;
    }, 1000);
  }
}
