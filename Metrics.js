export default class {
  constructor(args) {
    // Получение куки 'debug' через регулярное выражение
    this.debugMode = document.cookie.match(new RegExp('(^| )debug=([^;]+)'));
    // Идентификационный номер Яндекс.метрики
    this.yaCounter = args.yaCounter;

    const yandexCallers = document.querySelectorAll('.js-ya-goal');
    const googleCallers = document.querySelectorAll('.js-ga-goal');

    // Привязка трекеров клика
    [...yandexCallers].forEach((caller) => {
      caller.addEventListener('click', (ev) => this.handleClick(ev, 'yandex'));
    });
    [...googleCallers].forEach((caller) => {
      caller.addEventListener('click', (ev) => this.handleClick(ev, 'google'));
    });

    window.Metrics = this;
  }

  // Методы привязки событий трекеров
  handleClick(ev, type) {
    const el = ev.target;
    const isLink = el.tagName === 'A' && el.getAttribute('target') !== '_blank';

    if (isLink) {
      ev.preventDefault();
    }

    switch (type) {
      case 'yandex':
        const goal = el.getAttribute('data-goal');

        if (goal) {
          const params = el.getAttribute('data-params');

          if (isLink) {
            this.sendYandexEvent(goal, params, () => {
              window.location.href = el.getAttribute('href');
            });
          } else {
            this.sendYandexEvent(goal, params);
          }
        }
        break;
      case 'google':
        let action = el.getAttribute('data-ga-action');

        if (!action) {
          action = el.getAttribute('data-goal');
        }

        const params = el.getAttribute('data-ga-params') || {};

        if (isLink) {
          params['event_callback'] = () => {
            window.location.href = el.getAttribute('href');
          }
        }

        if (action) {
          this.sendGoogleEvent(action, params);
        }
      default:
    }
  }

  // Методы отправки событий трекеров
  sendGoogleEvent(action, params) {
    if (this.debugMode) {
      console.log(`GA goal: ${action}`);

      if (params) {
        console.log(params);
      }
    }

    if (typeof gtag === 'undefined') {
      if (params && params['event_callback']) {
        params['event_callback']()
      }
      return;
    }

    if (params) {
      gtag('event', action, params);
    } else {
      gtag('event', action);
    }
  }

  sendYandexEvent(goal, params, callback) {
    if (this.debugMode) {
      console.log(`Metrika goal: ${goal}`);

      if (params) {
        console.log(params);
      }
    }

    if (typeof window[this.yaCounter] === 'undefined') {
      return;
    }

    if (params) {
      window[this.yaCounter].reachGoal(goal, params, callback);
    } else {
      window[this.yaCounter].reachGoal(goal, null, callback);
    }
  }
}
