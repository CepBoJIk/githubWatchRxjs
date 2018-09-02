import { fromEvent, from } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

function sendRequest(method, url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.send();

    xhr.onload = function onload() {
      if (xhr.status !== 200) {
        const error = new Error(`${xhr.status}: ${xhr.statusText}`);
        reject(error);
      }
      resolve(xhr);
    };

    xhr.onerror = function onerror() {
      reject(new Error('network error'));
    };
  });
}

export default class FollowComponent {
  // constructor() { }

  init($removeBtn, $refreshBtn) {
    this.url = 'https://api.github.com/users';
    this.removeStream$ = fromEvent($removeBtn, 'click');
    this.refreshStream$ = fromEvent($refreshBtn, 'click');

    const requestElements$ = this.refreshStream$.pipe(
      startWith(null),
      map((value) => {
        if (!value) {
          return this.url;
        }
        const random = Math.floor(Math.random() * 500);
        return `${this.url}?since=${random}`;
      }),
    );

    const responseElements$ = requestElements$.pipe(
      map((value) => {
        const result = from(sendRequest('GET', value));
        
      }),
    );

    responseElements$.subscribe(this.showElement);
  }

  showElement(value) {
    console.log(value);
  }
}
