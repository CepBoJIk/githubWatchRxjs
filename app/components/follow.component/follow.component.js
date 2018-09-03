import { fromEvent, from, range } from 'rxjs';
import {
  map, startWith, flatMap, filter,
} from 'rxjs/operators';

const USERS_AMOUNT = 3;

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
      resolve(xhr.response);
    };

    xhr.onerror = function onerror() {
      reject(new Error('network error'));
    };
  });
}

export default class FollowComponent {
  constructor(template, box) {
    this.$template = template;
    this.$box = box;

    this.$box.removeChild(this.$template);
    this.createElements();
  }

  init(removeBtnClass, $refreshBtn) {
    this.url = 'https://api.github.com/users';
    this.refreshStream$ = fromEvent($refreshBtn, 'click');

    const removeBtn = removeBtnClass;
    const clickStream$ = fromEvent(this.$box, 'click');

    this.removeElementStream$ = clickStream$.pipe(
      filter((event) => {
        if (event.target.tagName === 'BUTTON' && event.target.classList.contains(removeBtn)) {
          return true;
        }
        return false;
      }),
    );

    const usersLintStream$ = this.getUsersListStream();

    usersLintStream$.subscribe((response) => {
      this.responseArray = JSON.parse(response);

      const stream$ = range(0, USERS_AMOUNT);
      const getUserStream$ = stream$.pipe(
        flatMap(() => {
          this.randomDontRepeat = [];
          return this.getRandomUser();
        }),
      );
      getUserStream$.subscribe((resp) => {
        const responseObj = JSON.parse(resp);
        this.showElement(null, responseObj);
      });
    });

    const removeElement$ = this.getRemoveElementStream();

    removeElement$.subscribe((response) => {
      const user = JSON.parse(response);

      let $targetElem = this.targetRemoveBtn;
      while (!$targetElem.classList.contains('widget-item')) {
        if ($targetElem.tagName === 'BODY') {
          return;
        }
        $targetElem = $targetElem.parentElement;
      }

      $targetElem.classList.add('empty-elem');
      this.showElement($targetElem, user);
    });
  }

  getUsersListStream() {
    const requestElements$ = this.refreshStream$.pipe(
      startWith(null),
      map((value) => {
        this.removeElements();
        if (!value) {
          return this.url;
        }
        const random = Math.floor(Math.random() * 500);
        return `${this.url}?since=${random}`;
      }),
    );
    const responseElements$ = requestElements$.pipe(
      flatMap(requestUrl => from(sendRequest('GET', requestUrl))),
    );

    return responseElements$;
  }

  getRemoveElementStream() {
    const removeElement$ = this.removeElementStream$.pipe(
      flatMap((event) => {
        this.targetRemoveBtn = event.target;
        return this.getRandomUser();
      }),
    );

    return removeElement$;
  }

  getRandomUser() {
    let random = Math.floor(Math.random() * this.responseArray.length);
    let count = 0;
    while (this.randomDontRepeat[random]) {
      count += 1;
      if (count >= this.responseArray.length) {
        this.randomDontRepeat = [];
        count = 0;
      }
      random = Math.floor(Math.random() * this.responseArray.length);
    }
    this.randomDontRepeat[random] = true;

    const user = this.responseArray[random];

    return from(sendRequest('GET', user.url));
  }

  createElements() {
    while (this.$box.children.length < USERS_AMOUNT) {
      const $elem = this.$template.cloneNode(true).content.children[0];
      $elem.classList.add('empty-elem');
      this.showElement($elem);
    }
  }

  showElement($elem, user = {}) {
    let $element = $elem;

    if (!$element) {
      const $children = Array.from(this.$box.children);
      const emptyElems = $children.filter(child => child.classList.contains('empty-elem'));
      [$element] = emptyElems;
    }

    const $avatar = $element.querySelector('.widget-item__img');
    const $name = $element.querySelector('.widget-item__name');
    const $location = $element.querySelector('.widget-item__location');
    const $login = $element.querySelector('.widget-item__login');

    const avatarUrl = user.avatar_url || 'https://avatars1.githubusercontent.com/u/41323066?s=460&v=4';
    $avatar.setAttribute('src', avatarUrl);
    $name.textContent = user.name || 'Гость';
    $location.textContent = user.location || 'не указано';
    $login.textContent = `@${user.login}` || 'не указан';

    if (user.name || user.avatar_url || user.location) {
      $element.classList.remove('empty-elem');
      return;
    }
    this.$box.appendChild($element);
  }

  removeElements() {
    const $children = Array.from(this.$box.children);

    $children.forEach((child) => {
      child.classList.add('empty-elem');
      this.showElement(child);
    });
  }
}
