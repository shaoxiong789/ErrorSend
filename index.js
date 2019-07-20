class ErrorSend {
        constructor() {
          this.console();          
        }
        nt = null
        store = new Proxy([], {
          get: (target, key, receiver) => {
            return Reflect.get(target, key, receiver);
          },
          set: (target, key, value, receiver) => {
            clearTimeout(this.nt);
            this.nt = setTimeout(() => {
              this.send()
            }, 500)
            return Reflect.set(target, key, value, receiver);
          }
        })

        push(obj) {
          this.store.push(obj)
        }

        console() {
          let _this = this;
          window.onerror = function (msg, url, line, col, error) {
            console.log(msg, url, line, col, error)
            _this.push({
                type: 'error',
                msg: error,
                url,
                line,
                col
            });
            // new Image().src = _this.settings.repUrl + '?error=' + error.stack + '&repMsg=' + _this.settings
            //     .repMsg;
          }
          
          document.addEventListener("error",function(event){
            let url = '';
            if (event.target.localName == 'link') {
              url = event.target.href;
            }
            else {
              url = event.target.src;
            }
            _this.push({
              type: 'error',
              msg: `${event.target.localName} of ${url} Error! `
            })
          },true);

          var open = window.XMLHttpRequest.prototype.open;
          window.XMLHttpRequest.prototype.open = function (method, url) {
              this.addEventListener('readystatechange', function () {
                if (this.readyState == 4 && this.status != 200) {
                  _this.push({
                    type: 'error',
                    msg: `${method} ${url} ${this.status} (Service Unavailable)`
                  })
                }
              })
              open.apply(this, arguments);
          }

          new Array('warn', 'debug', 'error').forEach((type) => {
            var method = console[type];
            console[item] = function() {
              console.log(arguments[0]);
              _this.push({
                  type: 'log',
                  msg: arguments[0] + "",
              })
              method.apply(console, arguments);
            }
          })
        }
        send() {
          var cache = [];
          fetch('http://localhost:8081/xxxxxxxxxx', {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              source: window.location.href,
              loggin: this.store
            }, function(key, value) {
              if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                  return;
                }
                cache.push(value);
              }
              return value;
            })
          }).then(function(response) {
            if(response.status === 200){
              return response.json();
            }else{
              return {}
            }

          });
        }
      }
