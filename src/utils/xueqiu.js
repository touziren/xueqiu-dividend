/* 雪球相关操作 */

/* common */
// 将股票代码转换为雪球代码
export function code_to_symbol(code){
  code = code.trim();
  if(code && code.length == 6) {
    if(code.startsWith('0') || code.startsWith('3') ) {
      return 'SZ' + code;
    } else if(code.startsWith('6')) {
      return 'SH' + code;
    }
  }
  return code;
}

export function get_xueqiu_detail_url(code) {
    var preffix = 'https://xueqiu.com/S/';
    return preffix + code_to_symbol(code);
}

export function get_quote_url(codes) {
  var url_template = 'https://stock.xueqiu.com/v5/stock/batch/quote.json?symbol={symbol}&extend=detail&is_delay_hk=false';

  if(typeof(codes) == 'string') {
    if(codes.length > 0) {
      codes = code_to_symbol(codes);
      return url_template.replace('{symbol}', codes);
    }
  }

  if(typeof(codes) == 'object') {
    if(codes.length > 0) {
      codes = codes.map(r=>code_to_symbol(r));
      return url_template.replace('{symbol}', codes.join(','));
    }
  }

  return null;
}

export function get_quote_data(codes) {
    var quote_url = get_quote_url(codes);
    try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', quote_url, false); // 第三个参数设置为 false，表示同步模式
        xhr.withCredentials = true; // 设置 withCredentials 为 true，以携带 cookie
        xhr.send();

        if (xhr.status >= 200 && xhr.status < 300) {
            return JSON.parse(xhr.responseText);
        } else {
            throw new Error('Error: ' + xhr.statusText);
        }
        // const res = await fetch(quote_url, {credentials: 'include'});
        // const data = await res.json()
    } catch (e) {
        console.error(e)
    }

    return null;
}



/* realtime quote data */
export function get_xueqiu_quote_url(symbol, extend=null, use_dt=false) {
  var preffix = 'https://xueqiu.com/S/';
  return preffix + code_to_symbol(code);
}

export function get_xueqiu_realtime_quotec_url(symbol, use_dt=true) {
  const prefix = 'https://stock.xueqiu.com/v5/stock/realtime/quotec.json';
  let url = prefix + '?symbol=' + code_to_symbol(symbol);

  if (use_dt) {
    url += '&_=' + Date.now();
  }

  return url
}

export function get_realtime_quote_data(code) {
  var quote_url = get_xueqiu_realtime_quotec_url(code);
  try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', quote_url, false); // 第三个参数设置为 false，表示同步模式
      xhr.withCredentials = true; // 设置 withCredentials 为 true，以携带 cookie
      xhr.send();

      if (xhr.status >= 200 && xhr.status < 300) {
          return JSON.parse(xhr.responseText);
      } else {
          throw new Error('Error: ' + xhr.statusText);
      }
      // const res = await fetch(quote_url, {credentials: 'include'});
      // const data = await res.json()
  } catch (e) {
      console.error(e)
  }

  return null;
}
