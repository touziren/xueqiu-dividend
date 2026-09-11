import React, { useEffect, useState } from 'react'

import update_logo from '../../assets/update.svg'
import './currency.css'

import {get_realtime_quote_data} from '../utils/xueqiu.js';
import {formatDateTime} from '../utils/formater.js';
import * as local from '../utils/local_db.js';
import {currency_data_key} from '../utils/local_db_key.js';

function Currency(props) {
    const code = props.code;
    const title = props.title;
    const [value, setValue] = useState(
        props.value || local.map_a_get(currency_data_key, code, null) || {
            val: 0,
            dt: null
        }
    );

    const updateCurrency = () => {
        const rep = get_realtime_quote_data(code);
        if(rep != null) {
            let newVal = {'val': rep.data[0].current, 'dt': rep.data[0].timestamp};
            setValue(newVal);
            local.map_a_set(currency_data_key, code, newVal);
        } else {
            console.log('updateCurrency is error in currency.jsx!')
        }
    };

    useEffect(() => {
        updateCurrency();
    
        const timer = setInterval(() => {
            updateCurrency();
        }, 6000);
    
        return () => {
            clearInterval(timer);
        };
    }, [code]);

    return (
        <div className="currency">
            <span>{title || code || 'error code'}</span>
            <span>
                {value?.val > 0 ? value.val : '--'}
            </span>
            <span className="time">
                {formatDateTime(value?.dt)}
            </span>
            <span className="update-btn" onClick={updateCurrency}>
                <img src={update_logo} alt="更新" title="更新" />
            </span>
        </div>
    )
}

export default Currency;