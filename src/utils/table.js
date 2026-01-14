export function sortTable(columnIndex) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.querySelector('.table-clean');
    switching = true;
    dir = 'asc'; // 设置默认排序方向为升序
    var headers = table.querySelectorAll('thead th');
    var currentHeader = headers[columnIndex];

    // 移除所有表头的排序样式
    headers.forEach(header => {
        header.classList.remove('sorted-asc', 'sorted-desc');
    });

    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName('TD')[columnIndex];
            y = rows[i + 1].getElementsByTagName('TD')[columnIndex];

            // 检测内容类型并进行排序
            var xContent = x.innerHTML.trim();
            var yContent = y.innerHTML.trim();

            // 尝试将内容转换为数值
            var xNum = parseFloat(xContent);
            var yNum = parseFloat(yContent);

            if (!isNaN(xNum) && !isNaN(yNum)) {
                // 如果内容是数值，则按数值排序
                if (dir === 'asc') {
                    if (xNum > yNum) {
                        shouldSwitch = true;
                        break;
                    }
                } else if (dir === 'desc') {
                    if (xNum < yNum) {
                        shouldSwitch = true;
                        break;
                    }
                }
            } else {
                // 如果内容不是数值，则按字符串排序
                if (dir === 'asc') {
                    if (xContent.toLowerCase() > yContent.toLowerCase()) {
                        shouldSwitch = true;
                        break;
                    }
                } else if (dir === 'desc') {
                    if (xContent.toLowerCase() < yContent.toLowerCase()) {
                        shouldSwitch = true;
                        break;
                    }
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else {
            if (switchcount === 0 && dir === 'asc') {
                dir = 'desc';
                switching = true;
            }
        }
    }

    // 添加排序状态样式
    if (dir === 'asc') {
        currentHeader.classList.add('sorted-asc');
    } else {
        currentHeader.classList.add('sorted-desc');
    }
}


/*展示表格*/
export function show_stock_table(group_name) {
    const tbody = document.querySelector('.table-clean tbody');
    tbody.innerHTML = '';

    var defaultQuote = {
        name: '-',
        code: '-',
        currency: '-',
        open: '-',
        current: '-',
        dividend: '-',
        pb: '-',
        pe_lyr: '-',
        pe_forecast: '-',
        pe_ttm: '-'
    };

    // 判断是否要从雪球获取数据
    const group_data_dt = group_name + '_dt';
    const last_dt = localStorage.getItem(group_data_dt);
    const live_seconds = (Date.now() - last_dt) / 1000;
    if(last_dt == null || live_seconds > MAX_LIVE_SECONDS) {
      // 更新组数据
      const codes = get_code_array(group_name);
      const response = get_quote_data(codes);
      const items = response.data.items;

      var data = {}
      for(var i=0; i<items.length; i++) {
        const row = items[i];
        const tag = row.quote.code;
        data[tag] = row;
      }

      // 更新localDB
      set_data(group_name, data);

      out = '重新从雪球获取数据，group_name={group}, live={live}秒'
      out = out.replace('{group}', group_name).replace('{live}', live_seconds)
      console.log(out, data)

      // 更新时间
      localStorage.setItem(group_data_dt, Date.now());
    }

    // 展示表格
    const group_data = get_data(group_name);
    for(var code in group_data){
        try {
            var data = group_data[code];
            defaultQuote.code = code;
            const quote = data ? data.quote: defaultQuote;

            const tr = createTr(quote);
            tbody.appendChild(tr);
        } catch (e) {
            console.error(e)
        }
    }
}

export function save_stocks(group_name, codes_str) {
  if(codes_str.indexOf(',') != -1){
    const codes = codes_str.split(',');
    for(var code of codes){
      code = code.trim();
      var flag = save_code(group_name, code);
      if(flag) {
        var data = get_quote_data(code);
        data = data.data.items[0];
        set_stock_data(group_name, data);
      }
    }
  } else{
    const code = codes_str.trim();
    var flag = save_code(group_name, code);
    if(flag) {
      var data = get_quote_data(code);
      data = data.data.items[0];
      set_stock_data(group_name, data);
    }
  }
}

export function del_table_row(group_name, code) {
  del_code(group_name, code);
  del_stock_data(group_name, code);
  show_stock_table(GROUP_NAME);
}