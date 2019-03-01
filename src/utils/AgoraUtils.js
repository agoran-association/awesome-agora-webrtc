/**
 * Proxy for Agora Web SDK 2.5.0 which provide an enhanced 
 * event emitter and tranfer methods with callback to promise
 * 
 * By Hao Yang on Feb 2019
 */

const enhanceClient = function(client) {
  // declare handler for proxy
  const handler = {
    get: function(target, prop, receiver) {
      const origin = Reflect.get(target, prop, receiver);
      if (origin instanceof Function) {
        return new Proxy(origin, methodsProxyHandler(prop))
      } 
      return origin
    }
  };

  const methodsProxyHandler = function(prop) {
    return {
      apply: function(target, thisArg, argumentList) {
        switch(prop) {
          default:
            return target(...argumentList);
          case 'init':
            return new Promise(function(resolve, reject) {
              target(argumentList[0], resolve, reject)
            });
          case 'join':
            return new Promise(function(resolve, reject) {
              target(argumentList[0], argumentList[1], argumentList[2], resolve, reject)
            });
          case 'leave':
            return new Promise(function(resolve, reject) {
              target(resolve, reject);
            });
          case 'publish':
            return new Promise(function(resolve, reject) {
              setTimeout(resolve)
              target(argumentList[0], reject);
            });
          case 'subscribe':
            return new Promise(function(resolve, reject) {
              setTimeout(resolve)
              target(argumentList[0], reject);
            });          
          case 'unpublish':
            return new Promise(function(resolve, reject) {
              setTimeout(resolve)
              target(argumentList[0], reject);
            });
          case 'unsubscribe':
            return new Promise(function(resolve, reject) {
              setTimeout(resolve)
              target(argumentList[0], reject);
            });
          case 'enableDualStream':
            return new Promise(function(resolve, reject) {
              target(resolve, reject);
            });
          case 'getCameras':
            return new Promise(function(resolve, reject) {
              target(resolve, reject);
            });
          case 'getLocalAudioStats':
            return new Promise(function(resolve, reject) {
              target(resolve, reject);
            });
          case 'getLocalVideoStats':
            return new Promise(function(resolve, reject) {
              target(resolve, reject);
            });
          case 'getNetworkStats':
            return new Promise(function(resolve, reject) {
              target(resolve, reject);
            });
          case 'getPlayoutDevices':
            return new Promise(function(resolve, reject) {
              target(resolve, reject);
            });
          case 'getRecordingDevices':
            return new Promise(function(resolve, reject) {
              target(resolve, reject);
            });
          case 'getRemoteAudioStats':
            return new Promise(function(resolve, reject) {
              target(resolve, reject);
            });
          case 'getRemoteVideoStats':
            return new Promise(function(resolve, reject) {
              target(resolve, reject);
            });
          case 'getSystemStats':
            return new Promise(function(resolve, reject) {
              target(resolve, reject);
            });
          case 'getTransportStats':
            return new Promise(function(resolve, reject) {
              target(resolve, reject);
            });
        }
      }
    }
  }

  // do proxy
  return new Proxy(client, handler);
};

const enhanceStream = function(stream) {
  // declare handler for proxy
  const handler = {
    get: function(target, prop, receiver) {
      const origin = Reflect.get(target, prop, receiver);
      if (origin instanceof Function) {
        return new Proxy(origin, methodsProxyHandler(prop))
      } 
      return origin
    }
  }

  const methodsProxyHandler = function(prop) {
    return {
      apply: function(target, thisArg, argumentList) {
        switch(prop) {
          default:
            return target(...argumentList);
          case 'init':
            return new Promise(function(resolve, reject) {
              target(resolve, reject);
            });
          case 'getStats':
            return new Promise(function(resolve, reject) {
              target(resolve, reject);
            });
        }
      }
    }
  }

  // do proxy
  return new Proxy(stream, handler);
};

export { enhanceStream, enhanceClient };
