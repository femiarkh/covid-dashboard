import '../styles/keyboard.scss';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const Keyboard = {
  elements: {
    main: null,
    keysContainer: null,
    keys: [],
  },

  eventHandlers: {
    oninput: null,
    onclose: null,
    onSoundOn(evt) {
      if (evt.target.closest('button')) {
        const soundType = evt.target.closest('button').getAttribute('data-key');
        const audio = document.querySelector(`audio[data-key=${soundType}]`);
        if (!audio) {
          return;
        }
        audio.currentTime = 0;
        audio.play();
      }
    },
    startSpeechTranscription(evt) {
      if (Keyboard.properties.selectionStart !== null) {
        const start = Keyboard.properties.value.slice(0, Keyboard.properties.selectionStart);
        const end = Keyboard.properties.value.slice(Keyboard.properties.selectionEnd);
        Keyboard.properties.value = start + end;
        Keyboard.properties.caretPosition = Keyboard.properties.selectionStart;
        Keyboard.properties.selectionStart = null;
        Keyboard.properties.selectionEnd = null;
      }

      const transcript = Array.from(evt.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join('');

      const start = Keyboard.properties.value.slice(0, Keyboard.properties.caretPosition);
      const end = Keyboard.properties.value.slice(Keyboard.properties.caretPosition);
      Keyboard.properties.value = `${start}${transcript}${end}`;

      Keyboard.properties.caretPosition += transcript.length;

      Keyboard.triggerEvent('oninput');
    },
  },

  properties: {
    value: '',
    caretPosition: 0,
    selectionStart: null,
    selectionEnd: null,
    currentLanguage: 'en',
    capsLock: false,
    shift: false,
    pressedKeys: [],
    keyCodes: [],
    soundOn: true,
    speechOn: false,
    recognition: null,
  },

  init() {
    this.elements.main = document.createElement('div');
    this.elements.keysContainer = document.createElement('div');

    this.elements.main.classList.add('keyboard', 'keyboard--hidden');
    this.elements.keysContainer.classList.add('keyboard__keys');
    this.properties.currentLanguage = 'en';
    this.elements.keysContainer.append(this.createKeys(this.properties.currentLanguage));

    this.elements.main.append(this.elements.keysContainer);
    document.body.append(this.elements.main);

    this.elements.keys = Array.from(this.elements.keysContainer.querySelectorAll('.keyboard__key'));

    document.querySelectorAll('.use-keyboard-input').forEach((element) => {
      element.addEventListener('click', (evt) => {
        if (evt.getModifierState('CapsLock')) {
          this.properties.capsLock = true;
          this.elements.keys.forEach((key) => {
            if (key.childElementCount === 0) {
              const isOnlyCaps = this.properties.capsLock && !this.properties.shift;
              const isOnlyShift = !this.properties.capsLock && this.properties.shift;
              const upper = key.textContent.toUpperCase();
              const lower = key.textContent.toLowerCase();
              key.textContent = isOnlyCaps || isOnlyShift ? upper : lower;
            }
          });
          const capsButton = Array.from(this.elements.keys).find((key) => key.textContent === 'keyboard_capslock');
          capsButton.classList.add('keyboard__key--active');
        } else {
          this.properties.capsLock = false;
          this.elements.keys.forEach((key) => {
            if (key.childElementCount === 0) {
              const isOnlyCaps = this.properties.capsLock && !this.properties.shift;
              const isOnlyShift = !this.properties.capsLock && this.properties.shift;
              const upper = key.textContent.toUpperCase();
              const lower = key.textContent.toLowerCase();
              key.textContent = isOnlyCaps || isOnlyShift ? upper : lower;
            }
          });
          const capsButton = Array.from(this.elements.keys).find((key) => key.textContent === 'keyboard_capslock');
          capsButton.classList.remove('keyboard__key--active');
        }
      });

      element.addEventListener('focus', () => {
        this.elements.main.addEventListener('pointerdown', (evt) => {
          evt.preventDefault();
          element.focus();
        });
        this.open(element.value, (currentValue) => {
          element.value = currentValue;
          element.selectionStart = this.properties.caretPosition;
          element.selectionEnd = this.properties.caretPosition;
        }, () => {
          element.blur();
        });
      });

      document.addEventListener('click', () => {
        if (element.selectionStart !== element.selectionEnd) {
          this.properties.selectionStart = element.selectionStart;
          this.properties.selectionEnd = element.selectionEnd;
        } else {
          this.properties.selectionStart = null;
          this.properties.selectionEnd = null;
        }
        if (element.selectionStart === element.selectionEnd) {
          this.properties.caretPosition = element.selectionStart;
        }
      });

      element.addEventListener('keydown', () => {
        if (element.selectionStart !== element.selectionEnd) {
          this.properties.selectionStart = element.selectionStart;
          this.properties.selectionEnd = element.selectionEnd;
        } else {
          this.properties.selectionStart = null;
          this.properties.selectionEnd = null;
        }
        if (element.selectionStart === element.selectionEnd) {
          this.properties.caretPosition = element.selectionStart;
        }
      });

      element.addEventListener('keyup', () => {
        this.properties.value = element.value;
        this.properties.caretPosition = element.selectionStart;
      });

      element.addEventListener('keydown', (evt) => {
        if (evt.ctrlKey && evt.shiftKey) {
          const languageButton = Array.from(this.elements.keys).find((key) => key.textContent === 'en' || key.textContent === 'ru');
          const click = new Event('click');
          if (languageButton) {
            languageButton.dispatchEvent(click);
            return;
          }
        }

        if (evt.ctrlKey) {
          return;
        }

        if (this.properties.keyCodes.includes(evt.code)) {
          evt.preventDefault();
          const click = new Event('click');
          const index = this.properties.keyCodes.indexOf(evt.code);
          this.elements.keys[index].classList.add('highlight');
          const button = this.elements.keys[index];

          if (evt.code === 'ShiftLeft' && !this.properties.pressedKeys.includes('ShiftLeft')) {
            this.toggleShift();
            button.classList.toggle('keyboard__key--active', this.properties.shift);
          }

          if (!this.properties.pressedKeys.includes(evt.code)) {
            this.properties.pressedKeys.push(evt.code);
          }

          button.dispatchEvent(click);
        }
      });

      element.addEventListener('keyup', (evt) => {
        if (this.properties.pressedKeys.includes(evt.code)) {
          const index = this.properties.keyCodes.indexOf(evt.code);
          this.elements.keys[index].classList.remove('highlight');
          const pressedKeysIndex = this.properties.pressedKeys.indexOf(evt.code);
          const button = this.elements.keys[index];
          this.properties.pressedKeys.splice(pressedKeysIndex, 1);

          if (evt.code === 'CapsLock') {
            this.toggleCapsLock();
            button.classList.toggle('keyboard__key--active', this.properties.capsLock);
          }

          if (evt.code === 'ShiftLeft') {
            this.toggleShift();
            button.classList.toggle('keyboard__key--active', this.properties.shift);
          }
        }
      });
    });

    this.elements.keysContainer.addEventListener('click', Keyboard.eventHandlers.onSoundOn);
  },

  createKeys(language) {
    const fragment = document.createDocumentFragment();
    const keyLayoutEn = [
      ['`', '~'], ['1', '!'], ['2', '@'], ['3', '#'], ['4', '$'], ['5', '%'], ['6', '^'], ['7', '&'], ['8', '*'], ['9', '('], ['0', ')'], ['-', '_'], ['=', '+'], 'backspace',
      'sound', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', ['[', '{'], [']', '}'], 'enter',
      'caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', [';', ':'], ['\'', '\''], ['\\', '|'],
      'shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', [',', '<'], ['.', '>'], ['?', '/'], 'speech',
      'done', 'space', 'enRU', 'left', 'right',
    ];
    const keyLayoutRu = [
      'ё', ['1', '!'], ['2', '\''], ['3', '№'], ['4', ';'], ['5', '%'], ['6', ':'], ['7', '?'], ['8', '*'], ['9', '('], ['0', ')'], ['-', '_'], ['=', '+'], 'backspace',
      'sound', 'й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ', 'enter',
      'caps', 'ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э', ['\\', '/'],
      'shift', 'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', ['.', ','], 'speech',
      'done', 'space', 'enRU', 'left', 'right',
    ];

    this.properties.keyCodes = [
      'Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Backspace',
      'sound', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Enter',
      'CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Backslash',
      'ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'speech',
      'done', 'Space', 'enRU', 'ArrowLeft', 'ArrowRight',
    ];

    const createIconHTML = (iconName) => `<i class='material-icons'>${iconName}</i>`;

    const currentLayout = language === 'en' ? keyLayoutEn : keyLayoutRu;

    currentLayout.forEach((key) => {
      const keyElement = document.createElement('button');
      const insertLineBreak = currentLayout === keyLayoutEn ? ['backspace', ['\\', '|'].toString(), 'enter', 'speech'].indexOf(key.toString()) !== -1
        : ['backspace', 'enter', ['\\', '/'].toString(), 'speech'].indexOf(key.toString()) !== -1;

      keyElement.setAttribute('type', 'button');
      keyElement.classList.add('keyboard__key');
      let soundType;

      switch (key) {
        case 'backspace':
          keyElement.classList.add('keyboard__key--wide', 'keyboard__key--dark');
          keyElement.innerHTML = createIconHTML('backspace');
          soundType = (language === 'en') ? 'english-backspace' : 'russian-backspace';
          keyElement.setAttribute('data-key', soundType);

          keyElement.addEventListener('click', () => {
            const isPosZero = this.properties.caretPosition === 0;
            const noSelection = this.properties.selectionStart === this.properties.selectionEnd;
            if (isPosZero && noSelection) {
              return;
            }
            if (this.properties.selectionStart !== null) {
              const start = this.properties.value.slice(0, this.properties.selectionStart);
              const end = this.properties.value.slice(this.properties.selectionEnd);
              this.properties.value = `${start}${end}`;
              this.properties.caretPosition = this.properties.selectionStart;
              this.triggerEvent('oninput');
              return;
            }

            const fromStart = this.properties.value.slice(0, this.properties.caretPosition - 1);
            const tillEnd = this.properties.value.slice(this.properties.caretPosition);
            this.properties.value = `${fromStart}${tillEnd}`;
            this.properties.caretPosition += 1;
            this.triggerEvent('oninput');
          });

          break;

        case 'caps':
          keyElement.classList.add('keyboard__key--medium', 'keyboard__key--activatable', 'keyboard__key--dark');
          keyElement.innerHTML = createIconHTML('keyboard_capslock');
          soundType = (language === 'en') ? 'english-capslock' : 'russian-capslock';
          keyElement.setAttribute('data-key', soundType);

          keyElement.addEventListener('click', () => {
            if (this.properties.pressedKeys.includes('CapsLock')) {
              return;
            }

            this.toggleCapsLock();
            keyElement.classList.toggle('keyboard__key--active', this.properties.capsLock);
          });

          break;

        case 'shift':
          keyElement.classList.add('keyboard__key--wide', 'keyboard__key--activatable', 'keyboard__key--dark');
          keyElement.innerHTML = '<span>Shift</span>';
          soundType = (language === 'en') ? 'english-shift' : 'russian-shift';
          keyElement.setAttribute('data-key', soundType);

          keyElement.addEventListener('click', () => {
            if (this.properties.pressedKeys.includes('ShiftLeft')) {
              return;
            }

            this.toggleShift();
            keyElement.classList.toggle('keyboard__key--active', this.properties.shift);
          });

          break;

        case 'enRU':
          keyElement.classList.add('keyboard__key--wide', 'keyboard__key--dark');
          keyElement.textContent = currentLayout === keyLayoutEn ? 'en' : 'ru';
          soundType = (language === 'en') ? 'english-standard' : 'russian-standard';
          keyElement.setAttribute('data-key', soundType);

          keyElement.addEventListener('click', () => {
            this.toggleLanguage();
          });

          break;

        case 'left':
          keyElement.classList.add('keyboard__key--dark');
          keyElement.innerHTML = createIconHTML('keyboard_arrow_left');
          soundType = (language === 'en') ? 'english-standard' : 'russian-standard';
          keyElement.setAttribute('data-key', soundType);

          keyElement.addEventListener('click', () => {
            if (this.properties.caretPosition > 0) {
              this.properties.caretPosition -= 1;
              this.triggerEvent('oninput');
            }
          });

          break;

        case 'right':
          keyElement.classList.add('keyboard__key--dark');
          keyElement.innerHTML = createIconHTML('keyboard_arrow_right');
          soundType = (language === 'en') ? 'english-standard' : 'russian-standard';
          keyElement.setAttribute('data-key', soundType);

          keyElement.addEventListener('click', () => {
            if (this.properties.caretPosition < this.properties.value.length) {
              this.properties.caretPosition += 1;
              this.triggerEvent('oninput');
            }
          });

          break;

        case 'sound':
          keyElement.classList.add('keyboard__key--medium', 'keyboard__key--dark');
          keyElement.innerHTML = createIconHTML('volume_up');
          keyElement.addEventListener('click', () => {
            this.toggleSound();
            if (this.properties.soundOn) {
              keyElement.innerHTML = createIconHTML('volume_up');
            } else {
              keyElement.innerHTML = createIconHTML('volume_off');
            }
          });

          break;

        case 'speech':
          keyElement.classList.add('keyboard__key--medium', 'keyboard__key--dark');
          keyElement.innerHTML = createIconHTML('mic_off');
          soundType = (language === 'en') ? 'english-standard' : 'russian-standard';
          keyElement.setAttribute('data-key', soundType);
          keyElement.addEventListener('click', () => {
            this.toggleSpeech();
            if (this.properties.speechOn) {
              keyElement.innerHTML = createIconHTML('mic');
            } else {
              keyElement.innerHTML = createIconHTML('mic_off');
            }
          });

          break;

        case 'enter':
          keyElement.classList.add('keyboard__key--medium', 'keyboard__key--dark');
          keyElement.innerHTML = createIconHTML('keyboard_return');
          soundType = (language === 'en') ? 'english-enter' : 'russian-enter';
          keyElement.setAttribute('data-key', soundType);

          keyElement.addEventListener('click', () => {
            if (this.properties.selectionStart !== null) {
              const start = this.properties.value.slice(0, this.properties.selectionStart);
              const end = this.properties.value.slice(this.properties.selectionEnd);
              this.properties.value = `${start}${end}`;
              this.properties.caretPosition = this.properties.selectionStart;
            }

            const fromStart = this.properties.value.slice(0, this.properties.caretPosition);
            const tillEnd = this.properties.value.slice(this.properties.caretPosition);
            this.properties.value = `${fromStart}\n${tillEnd}`;
            this.properties.caretPosition += 1;
            this.triggerEvent('oninput');
          });

          break;

        case 'space':
          keyElement.classList.add('keyboard__key--extra-wide');
          keyElement.innerHTML = createIconHTML('space_bar');
          soundType = (language === 'en') ? 'english-standard' : 'russian-standard';
          keyElement.setAttribute('data-key', soundType);

          keyElement.addEventListener('click', () => {
            if (this.properties.selectionStart !== null) {
              const start = this.properties.value.slice(0, this.properties.selectionStart);
              const end = this.properties.value.slice(this.properties.selectionEnd);
              this.properties.value = `${start}${end}`;
              this.properties.caretPosition = this.properties.selectionStart;
            }

            const fromStart = this.properties.value.slice(0, this.properties.caretPosition);
            const tillEnd = this.properties.value.slice(this.properties.caretPosition);
            this.properties.value = `${fromStart} ${tillEnd}`;
            this.properties.caretPosition += 1;
            this.triggerEvent('oninput');
          });

          break;

        case 'done':
          keyElement.classList.add('keyboard__key--medium', 'keyboard__key--dark');
          keyElement.innerHTML = createIconHTML('check_circle');
          soundType = (language === 'en') ? 'english-standard' : 'russian-standard';
          keyElement.setAttribute('data-key', soundType);

          keyElement.addEventListener('click', () => {
            this.triggerEvent('onclose');
            this.close();
          });

          break;

        default:
          keyElement.innerHTML = (typeof key === 'object') ? `<span class='shift-1'>${key[1].toLowerCase()}</span><span class='shift-2'>${key[0].toLowerCase()}</span>` : `${key.toLowerCase()}`;
          soundType = (language === 'en') ? 'english-standard' : 'russian-standard';
          keyElement.setAttribute('data-key', soundType);

          keyElement.addEventListener('click', () => {
            if (this.properties.selectionStart !== null) {
              const start = this.properties.value.slice(0, this.properties.selectionStart);
              const end = this.properties.value.slice(this.properties.selectionEnd);
              this.properties.value = `${start}${end}`;
              this.properties.caretPosition = this.properties.selectionStart;
            }

            let currentKeyValue = key;
            if (typeof key === 'object') {
              currentKeyValue = this.properties.shift ? key[1] : key[0];
            }

            const isOnlyCaps = this.properties.capsLock && !this.properties.shift;
            const isOnlyShift = !this.properties.capsLock && this.properties.shift;
            const upper = currentKeyValue.toUpperCase();
            const lower = currentKeyValue.toLowerCase();
            currentKeyValue = isOnlyCaps || isOnlyShift ? upper : lower;

            const fromStart = this.properties.value.slice(0, this.properties.caretPosition);
            const tillEnd = this.properties.value.slice(this.properties.caretPosition);
            this.properties.value = `${fromStart}${currentKeyValue}${tillEnd}`;
            this.properties.caretPosition += 1;
            this.triggerEvent('oninput');
          });

          break;
      }

      fragment.append(keyElement);

      if (insertLineBreak) {
        fragment.append(document.createElement('br'));
      }
    });

    return fragment;
  },

  triggerEvent(handlerName) {
    if (typeof (this.eventHandlers[handlerName]) === 'function') {
      this.eventHandlers[handlerName](this.properties.value);
    }
  },

  toggleCapsLock() {
    this.properties.capsLock = !this.properties.capsLock;

    this.elements.keys.forEach((key) => {
      if (key.childElementCount === 0) {
        const isOnlyCaps = this.properties.capsLock && !this.properties.shift;
        const isOnlyShift = !this.properties.capsLock && this.properties.shift;
        const upper = key.textContent.toUpperCase();
        const lower = key.textContent.toLowerCase();
        key.textContent = isOnlyCaps || isOnlyShift ? upper : lower;
      }
    });
  },

  toggleShift() {
    this.properties.shift = !this.properties.shift;

    this.elements.keys.forEach((key) => {
      if (key.childElementCount === 2) {
        const keyString = Array.from(key.textContent).reverse().join('');
        [key.firstElementChild.textContent, key.lastElementChild.textContent] = keyString;
      }

      if (key.childElementCount === 0) {
        const isOnlyCaps = this.properties.capsLock && !this.properties.shift;
        const isOnlyShift = !this.properties.capsLock && this.properties.shift;
        const upper = key.textContent.toUpperCase();
        const lower = key.textContent.toLowerCase();
        key.textContent = isOnlyCaps || isOnlyShift ? upper : lower;
      }
    });
  },

  toggleLanguage() {
    this.properties.currentLanguage = this.properties.currentLanguage === 'en' ? 'ru' : 'en';
    this.elements.keysContainer.innerHTML = '';
    this.elements.keysContainer.append(this.createKeys(this.properties.currentLanguage));
    this.elements.keys = this.elements.keysContainer.querySelectorAll('.keyboard__key');
    const languageButton = Array.from(this.elements.keys).find((key) => key.textContent === 'en' || key.textContent === 'ru');
    languageButton.classList.add('highlight');
    setTimeout(() => {
      languageButton.classList.remove('highlight');
    }, 100);

    if (this.properties.capsLock) {
      this.elements.keys.forEach((key) => {
        if (key.childElementCount === 2) {
          const keyString = Array.from(key.textContent).join('');
          [key.firstElementChild.textContent, key.lastElementChild.textContent] = keyString;
        }

        if (key.childElementCount === 0) {
          const isOnlyCaps = this.properties.capsLock && !this.properties.shift;
          const isOnlyShift = !this.properties.capsLock && this.properties.shift;
          const upper = key.textContent.toUpperCase();
          const lower = key.textContent.toLowerCase();
          key.textContent = isOnlyCaps || isOnlyShift ? upper : lower;
        }
      });

      const capsKey = Array.from(this.elements.keys).find((elem) => elem.textContent === 'keyboard_capslock');
      capsKey.classList.toggle('keyboard__key--active', this.properties.capsLock);
    }

    if (this.properties.shift) {
      this.elements.keys.forEach((key) => {
        if (key.childElementCount === 2) {
          const keyString = Array.from(key.textContent).reverse().join('');
          [key.firstElementChild.textContent, key.lastElementChild.textContent] = keyString;
        }

        if (key.childElementCount === 0) {
          const isOnlyCaps = this.properties.capsLock && !this.properties.shift;
          const isOnlyShift = !this.properties.capsLock && this.properties.shift;
          const upper = key.textContent.toUpperCase();
          const lower = key.textContent.toLowerCase();
          key.textContent = isOnlyCaps || isOnlyShift ? upper : lower;
        }

        const shiftKey = Array.from(this.elements.keys).find((elem) => elem.textContent === 'Shift');
        shiftKey.classList.toggle('keyboard__key--active', this.properties.shift);
      });
    }

    if (this.properties.recognition) {
      this.toggleSpeech();
      this.toggleSpeech();
    }

    const micButton = Array.from(this.elements.keys).find((key) => key.textContent === 'mic' || key.textContent === 'mic_off');
    const soundButton = Array.from(this.elements.keys).find((key) => key.textContent === 'volume_up' || key.textContent === 'volume_off');

    if (this.properties.speechOn) {
      micButton.innerHTML = '<i class="material-icons">mic</i>';
    } else {
      micButton.innerHTML = '<i class="material-icons">mic_off</i>';
    }

    if (this.properties.soundOn) {
      soundButton.innerHTML = '<i class="material-icons">volume_up</i>';
    } else {
      soundButton.innerHTML = '<i class="material-icons">volume_off</i>';
    }
  },

  toggleSound() {
    this.properties.soundOn = !this.properties.soundOn;
    if (this.properties.soundOn) {
      this.elements.keysContainer.addEventListener('click', Keyboard.eventHandlers.onSoundOn);
    } else {
      this.elements.keysContainer.removeEventListener('click', Keyboard.eventHandlers.onSoundOn);
    }
  },

  toggleSpeech() {
    this.properties.speechOn = !this.properties.speechOn;

    if (this.properties.speechOn) {
      this.properties.recognition = new SpeechRecognition();
      this.properties.recognition.interimResults = false;
      this.properties.recognition.lang = `${this.properties.currentLanguage}`;
      this.properties.recognition.addEventListener('result', this.eventHandlers.startSpeechTranscription);
      this.properties.recognition.addEventListener('end', this.properties.recognition.start);
      this.properties.recognition.start();
    } else {
      this.properties.recognition.removeEventListener('result', this.eventHandlers.startSpeechTranscription);
      this.properties.recognition.removeEventListener('end', this.properties.recognition.start);
      this.properties.recognition.stop();
      this.properties.recognition = null;
    }
  },

  open(initialValue, oninput, onclose) {
    this.properties.value = initialValue || '';
    this.properties.caretPosition = this.properties.value.length;
    this.eventHandlers.oninput = oninput;
    this.eventHandlers.onclose = onclose;
    this.elements.main.classList.remove('keyboard--hidden');
  },

  close() {
    this.properties.value = '';
    this.eventHandlers.oninput = oninput;
    this.eventHandlers.onclose = onclose;
    this.elements.main.classList.add('keyboard--hidden');
  },
};

export default Keyboard;
