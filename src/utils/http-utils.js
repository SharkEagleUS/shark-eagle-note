import jwtDecode from 'jwt-decode';
import camelcaseKeys from 'camelcase-keys';
import conf from '../../env.json';

function getUrl(url) {
  return `${conf.server_endpoint}${url}`;
}

function get(url, headers = {}) {
  return fetch(getUrl(url), {
    headers: headers,
  });
}

function post(url, data, headers = {}) {
  return fetch(getUrl(url), {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

const isTokenExpired = token => {
  if (!token) return false;
  const decoded = jwtDecode(token);
  return Date.now() >= decoded.exp * 1000;
};

const checkUserAuthInfo = () => {
  return new Promise(function(resolve, reject) {
    chrome.storage.local.get(['token'], result => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        reject(chrome.runtime.lastError.message);
      } else {
        if (!result.token || !result.token.access_token) {
          reject(new Error('No token found!'));
          return;
        }
        if (isTokenExpired(result.token.access_token)) {
          if (!result.token.refresh_token || isTokenExpired(result.token.refresh_token)) {
            reject(new Error('Access token is expired, and no refresh token found.'));
            return;
          }
          // Use refresh token to renew access token.
          refreshToken(result.token.refresh_token)
            .then(r => resolve(r))
            .catch(e => reject(e));
        } else {
          resolve(result.token);
        }
      }
    });
  });
};

export const isLoggedIn = () => {
  return new Promise((resolve, reject) => {
    checkUserAuthInfo()
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
};

export const login = (email, token) => {
  return new Promise((resolve, reject) => {
    post('/login', {
      email: email,
      token: token,
    })
      .then(response => response.json())
      .then(token => {
        // Token should be returned here.
        chrome.storage.local.set({ token: token }, function() {
          resolve(token.access_token);
        });
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });
  });
};

export const emailVerify = email => {
  return new Promise((resolve, reject) => {
    post('/email', {
      email: email,
    })
      .then(response => response.json())
      .then(data => {
        resolve(data);
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });
  });
};

export const refreshToken = refreshToken => {
  return new Promise((resolve, reject) => {
    post('/refresh_token', {
      refresh_token: refreshToken,
    })
      .then(response => response.json())
      .then(token => {
        // Token should be returned here.
        chrome.storage.local.set({ token: token }, function() {
          resolve(token.access_token);
        });
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });
  });
};

export const fetchAllMyNotes = keyword => {
  return new Promise((resolve, reject) => {
    checkUserAuthInfo()
      .then(res => {
        const authStr = 'Bearer '.concat(res.access_token);
        get('/v1/annotations' + (keyword ? '?keyword=' + keyword : ''), { Authorization: authStr })
          .then(response => response.json())
          .then(data => {
            resolve(camelcaseKeys(data));
          })
          .catch(error => {
            console.log(error);
            reject(error);
          });
      })
      .catch(err => {
        reject(err);
      });
  });
};

export const fetchAllMyAnnotationsByUrl = url => {
  return new Promise((resolve, reject) => {
    checkUserAuthInfo()
      .then(res => {
        const authStr = 'Bearer '.concat(res.access_token);
        post('/v1/annotations', { url: url }, { Authorization: authStr })
          .then(response => response.json())
          .then(data => {
            resolve(camelcaseKeys(data));
          })
          .catch(error => {
            console.error(error);
            reject(error);
          });
      })
      .catch(err => {
        reject(err);
      });
  });
};

export const savePageAnnotation = pageAnnotation => {
  return new Promise((resolve, reject) => {
    checkUserAuthInfo()
      .then(res => {
        const authStr = 'Bearer '.concat(res.access_token);
        post('/v1/annotation', pageAnnotation, { Authorization: authStr })
          .then(response => response.json())
          .then(data => {
            resolve(camelcaseKeys(data));
          })
          .catch(error => {
            console.log(error);
            reject(error);
          });
      })
      .catch(err => {
        reject(err);
      });
  });
};

export const updatePageAnnotation = pageAnnotation => {
  return new Promise((resolve, reject) => {
    if (!pageAnnotation.id) {
      reject(new Error('Note update: Missing note id.'));
    }
    checkUserAuthInfo()
      .then(res => {
        const authStr = 'Bearer '.concat(res.access_token);
        post('/v1/annotation/' + pageAnnotation.id, pageAnnotation, { Authorization: authStr })
          .then(response => response.json())
          .then(data => {
            resolve(camelcaseKeys(data));
          })
          .catch(error => {
            console.error(error);
            reject(error);
          });
      })
      .catch(err => {
        reject(err);
      });
  });
};

export const deletePageAnnotation = pageAnnotationId => {
  return new Promise((resolve, reject) => {
    if (!pageAnnotationId || pageAnnotationId < 0) {
      reject(new Error('Note id to delete is not valid'));
    }
    checkUserAuthInfo()
      .then(res => {
        const authStr = 'Bearer '.concat(res.access_token);
        post('/v1/annotation/' + pageAnnotationId + '/delete', {}, { Authorization: authStr })
          .then(response => response.json())
          .then(data => {
            resolve();
          })
          .catch(error => {
            console.log(error);
            reject(error);
          });
      })
      .catch(err => {
        reject(err);
      });
  });
};
