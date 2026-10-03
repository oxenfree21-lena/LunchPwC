let sdkPromise;
let authenticationFailed = false;

export function loadNaverMaps(clientId) {
  if (authenticationFailed) return Promise.reject(new Error('auth'));
  if (window.naver?.maps?.Map) return Promise.resolve(window.naver.maps);
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    let settled = false;
    const timer = window.setTimeout(() => fail('network'), 15000);

    function fail(reason) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      script.remove();
      reject(new Error(reason));
    }

    window.navermap_authFailure = () => {
      authenticationFailed = true;
      window.dispatchEvent(new Event('naver-map-auth-error'));
      fail('auth');
    };
    script.onload = () => {
      if (settled) return;
      if (!window.naver?.maps?.Map) return fail('network');
      settled = true;
      clearTimeout(timer);
      resolve(window.naver.maps);
    };
    script.async = true;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}`;
    script.onerror = () => fail('network');
    document.head.appendChild(script);
  }).catch((error) => {
    sdkPromise = undefined;
    throw error;
  });
  return sdkPromise;
}
