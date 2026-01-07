// utils/request.js
const request =    (options) => { // request
  const defaultOptions = {
    timeout: 2000,
    header: {
      'Content-Type': 'application/json'
    }
  };
  return new Promise((resolve, reject) => {
    uni.request({
      ...defaultOptions,
      ...options,
      success: (res) => {
        if (res.statusCode === 200) { // 请求成功
          resolve(res.data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      },
      fail: (err) => {
		console.log("request:","请求失败")
        reject(err);
      }
    });
  });
};// request

export default request;