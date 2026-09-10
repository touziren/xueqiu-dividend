import {get_realtime_quote_data} from '../utils/xueqiu.js';
import * as local from '../utils/local_db.js';
import {currency_data_key} from '../utils/local_db_key.js';


/**
 * 定时更新外汇信息
 */
function update_task_hkd_cny() {
    const code = 'HKDCNY.FX';
    const rep = get_realtime_quote_data(code);
    if(rep != null) {
        let data = rep.data[0].current;
        let dt = rep.data[0].timestamp;
        local.map_a_set(currency_data_key, code, {'val': data, 'dt': dt});
    }
    setTimeout(update_task_hkd_cny, 6000)
}

update_task_hkd_cny()
