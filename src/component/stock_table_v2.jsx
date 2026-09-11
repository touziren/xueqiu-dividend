import React from 'react'

import * as xueqiu from '../utils/xueqiu.js';
import * as local from '../utils/local_db.js';
import './stock_table.css'
import './stock_table_xueqiu.css'
import { xueqiu_stock_codes_key } from '../utils/local_db_key.js'
import {formatDateTime, formatPercent} from '../utils/formater.js';

import question_mark from '../../assets/question_mark.svg'


class StockTableV2 extends React.Component {
  constructor(props) {
    super(props)
    const group = props.group ? props.group: '';
    const codes = local.map_a_get(xueqiu_stock_codes_key, group, []);

    this.state = {
      dt: Date.now(),
      // 排序
      sortCol: null,
      sortOrder: 'asc',
      
      // 证券代码
      codes: codes,
      stocks: {}
    }
    this.timer = null;

    this.refreshData = this.refreshData.bind(this);
  }

  del_row(code) {
    const group = this.props.group;
    code = code.toUpperCase();

    // 1. 删除 stocks 中对应的数据
    const stocks = { ...this.state.stocks };
    delete stocks[code];

    // 2. 删除 localStorage 中的 code
    var stock_codes = local.map_a_get(xueqiu_stock_codes_key, group, []);
    
    var idx = stock_codes.indexOf(code);
    if(idx>-1) {
      stock_codes.splice(idx, 1);
      local.map_a_set(xueqiu_stock_codes_key, group, stock_codes);
    }

    this.setState({
      dt: Date.now(),
      codes: stock_codes,
      stocks: stocks
    })
  }

  refreshData() {
    const group = this.props.group;
    const codes = local.map_a_get(
      xueqiu_stock_codes_key,
      group,
      []
    );

    const stocks = this.get_stock_data(codes);

    this.setState({
      dt: Date.now(),
      stocks: stocks,
      codes: codes
    });

    this.timer = setTimeout(
        this.refreshData,
        6000
    )
  }

  recordTd(record) {
    // 代码
    const code = record.quote.code;
    let url_code = xueqiu.code_to_symbol(code);
    // 名称
    const name = record.quote.name;
    const currency = record.quote.currency;
    const dividend = record.quote.dividend? record.quote.dividend: 0;
    // 当前价
    const current = record.quote.current? record.quote.current: 0.01;
    const last_close = record.quote.last_close? record.quote.last_close: 0.01;
    /* 市净率&市盈率 */
    const pb = record.quote.pb? record.quote.pb.toFixed(3): 0;
    // 市盈率（静）
    const pe_lyr = record.quote.pe_lyr? record.quote.pe_lyr: 0;
    // 市盈率（动）
    const pe_forecast = record.quote.pe_forecast? record.quote.pe_forecast: 0;
    // 市盈率（ttm）
    const pe_ttm = record.quote.pe_ttm? record.quote.pe_ttm: 0;
    // 股息率
    const dividend_rate = dividend / current;
    const dividend_rate_fee_behind = dividend_rate * (currency == 'HKD'? 0.8: 1);
    // 当日涨跌幅
    const inc = (current - last_close).toFixed(3);
    const inc_rate = (((current - last_close) / last_close) * 100).toFixed(2);

    const dt = record.quote.timestamp;

    return (
      <tr key={code}>
        <td>
          <a href={"/S/" + url_code} target="_blank" data-analytics="1024" data-analytics-page="1000" data-analytics-data="{symbol:'01658',tab: '自选股票'}" className="name">
            {name}</a>
          <a href={"/S/" + url_code} target="_blank" data-analytics="1024" data-analytics-page="1000" data-analytics-data="{symbol:'01658',tab: '自选股票'}" className="code">
            {currency == 'HKD' && <i className="iconimg icon-hk"></i>}
            {currency == 'USD' && <i className="iconimg icon-us"></i>}
            <span>{url_code}</span>
          </a>
          <div className="code">{formatDateTime(dt)}</div>
        </td>
        <td>{current}</td>
        <td className={inc > 0 ? "gain" : inc < 0 ? "slip" : ""}>
          <i className="iconfont ontime"></i>
          <span style={{ fontSize: '14px' }}>
            {inc >= 0 ? '+' + inc : inc} ({inc >= 0 ? '+' + inc_rate : inc_rate}%)
          </span>
        </td>
        <td>{dividend}</td>
        <td>{formatPercent(dividend_rate)}</td>
        <td>{formatPercent(dividend_rate_fee_behind)}</td>
        <td>{pb}</td>
        <td>{pe_lyr}</td>
        <td>{pe_forecast}</td>
        <td>{pe_ttm}</td>
        <td>
          <span className="ctl_del" onClick={() => { this.del_row(code) }}>删除</span>
        </td>
      </tr>
    )
  }

  sortBy = (col) => {
    this.setState((prevState) => {
      let order = 'asc';
      if (prevState.sortCol === col) {
        order = prevState.sortOrder === 'asc' ? 'desc' : 'asc'; // 切换升降
      }
      return {
        sortCol: col,
        sortOrder: order
      }
    });
  }

  get_stock_data = (codes) => {
    var stocks = {};
    if (codes.length > 0) {
        stocks = xueqiu.get_quote_data(codes);
        stocks = stocks.data.items;
        // 转map
        var stocks_map = {};
        for (var r of stocks) {
            var c = r.quote.code;
            stocks_map[c] = r;
        }
        stocks = stocks_map;
    }
    return stocks;
  }

  render() {
    console.log(this.props.group)
    const stocks = this.state.stocks;

    // 排序
    let stockArray = Object.entries(stocks); // [[code, record], ...]
    if (this.state.sortCol) {
      if (this.state.sortCol == 'name') {
        stockArray.sort(([codeA, recA], [codeB, recB]) => {
          let a = recA.quote.name;
          let b = recB.quote.name;

          const result = a.localeCompare(b, 'zh-CN');
          return this.state.sortOrder === 'asc'? result: -result;
        });
      } else if (this.state.sortCol == 'inc_rate') {
        stockArray.sort(([codeA, recA], [codeB, recB]) => {
          let a = ((recA.quote.current - recA.quote.last_close) / recA.quote.last_close) * 100;
          let b = ((recB.quote.current - recB.quote.last_close) / recB.quote.last_close) * 100;

          if (this.state.sortOrder === 'asc') {
            return a - b;
          } else {
            return b - a;
          }
        });
      } else if (this.state.sortCol == 'dividend_rate') {
        stockArray.sort(([codeA, recA], [codeB, recB]) => {
          let a = (recA.quote.dividend / recA.quote.current) * 100;
          let b = (recB.quote.dividend / recB.quote.current) * 100;

          return this.state.sortOrder === 'asc' ? a - b : b - a;
        });
      } else if (this.state.sortCol == 'dividend_rate_fee_behind' ) {
        stockArray.sort(([codeA, recA], [codeB, recB]) => {
          let a = (recA.quote.dividend / recA.quote.current) * 100 * (recA.quote.currency == 'HKD'? 0.8: 1);
          let b = (recB.quote.dividend / recB.quote.current) * 100 * (recB.quote.currency == 'HKD'? 0.8: 1);

          return this.state.sortOrder === 'asc' ? a - b : b - a;
        });
      } else {
        stockArray.sort(([codeA, recA], [codeB, recB]) => {
          let a = recA.quote[this.state.sortCol];
          let b = recB.quote[this.state.sortCol];
          a = a? a: 0;
          b = b? b: 0;
          // console.log('xvzv', a,b, this.state.sortCol, this.state)
          if (typeof a === 'string') a = a.toUpperCase();
          if (typeof b === 'string') b = b.toUpperCase();

          if (a < b) return this.state.sortOrder === 'asc' ? -1 : 1;
          if (a > b) return this.state.sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }

    return (
      <table className="stock-table optional__tb">
        <thead>
          <tr>
            <th onClick={() => this.sortBy('name')}>
              <span className="thead">股票</span>
              <i className={`iconimg icon-sort ${this.state.sortCol === 'name' ? (this.state.sortOrder === 'asc' ? 'icon-asc' : 'icon-desc') : 'icon-custom'}`}></i>
            </th>
            <th onClick={() => this.sortBy('current')}>
              <span className="thead">当前价</span>
              <i className={`iconimg icon-sort ${this.state.sortCol === 'current' ? (this.state.sortOrder === 'asc' ? 'icon-asc' : 'icon-desc') : 'icon-custom'}`}></i>
            </th>
            <th onClick={() => this.sortBy('inc_rate')}>
              <span className="thead">涨跌幅</span>
              <i className={`iconimg icon-sort ${this.state.sortCol === 'inc_rate' ? (this.state.sortOrder === 'asc' ? 'icon-asc' : 'icon-desc') : 'icon-custom'}`}></i>
            </th>
            <th onClick={() => this.sortBy('dividend')}>
              <span className="thead">股息</span>
              <i className={`iconimg icon-sort ${this.state.sortCol === 'dividend' ? (this.state.sortOrder === 'asc' ? 'icon-asc' : 'icon-desc') : 'icon-custom'}`}></i>
            </th>
            <th onClick={() => this.sortBy('dividend_rate')}>
              <span className="thead">股息率</span>
              <i className={`iconimg icon-sort ${this.state.sortCol === 'dividend_rate' ? (this.state.sortOrder === 'asc' ? 'icon-asc' : 'icon-desc') : 'icon-custom'}`}></i>
            </th>
            <th onClick={() => this.sortBy('dividend_rate_fee_behind')} style={{display: 'flex', alignItems: 'center'}}>
              <span className="thead">股息率(税后)</span>
              <img src={question_mark} title="A股股息率未扣税（长期持有），港股股息率=实际股息率*0.8；即方便对比长期投资者实际获得差异。" style={{height: '1rem'}}/>
              <i className={`iconimg icon-sort ${this.state.sortCol === 'dividend_rate_fee_behind' ? (this.state.sortOrder === 'asc' ? 'icon-asc' : 'icon-desc') : 'icon-custom'}`}></i>
            </th>
            <th onClick={() => this.sortBy('pb')}>
              <span className="thead">市净率</span>
              <i className={`iconimg icon-sort ${this.state.sortCol === 'pb' ? (this.state.sortOrder === 'asc' ? 'icon-asc' : 'icon-desc') : 'icon-custom'}`}></i>
            </th>
            <th onClick={() => this.sortBy('pe_lyr')}>
              <span className="thead">市盈率(静)</span>
              <i className={`iconimg icon-sort ${this.state.sortCol === 'pe_lyr' ? (this.state.sortOrder === 'asc' ? 'icon-asc' : 'icon-desc') : 'icon-custom'}`}></i>
            </th>
            <th onClick={() => this.sortBy('pe_forecast')}>
              <span className="thead">市盈率(动)</span>
              <i className={`iconimg icon-sort ${this.state.sortCol === 'pe_forecast' ? (this.state.sortOrder === 'asc' ? 'icon-asc' : 'icon-desc') : 'icon-custom'}`}></i>
            </th>
            <th onClick={() => this.sortBy('pe_ttm')}>
              <span className="thead">市盈率(TTM)</span>
              <i className={`iconimg icon-sort ${this.state.sortCol === 'pe_ttm' ? (this.state.sortOrder === 'asc' ? 'icon-asc' : 'icon-desc') : 'icon-custom'}`}></i>
            </th>
            <th>
              <span className="thead">管理</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {stockArray.map(([code, record]) => this.recordTd(record))}
          <tr className="table-note">
            <td colSpan="10">
                <div>刷新时间： {formatDateTime(this.state.dt)}</div>
                <div>注：汇率数据、分红数据仅供参考，实际数据以市场行情和公告为准。</div>
            </td>
          </tr>
        </tbody>
        
      </table>
    )
  }

  componentDidMount() {
    this.refreshData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.group !== this.props.group || prevProps.update !== this.props.update) {

      // 清除旧 timer
      if (this.timer) {
        clearTimeout(this.timer);
      }

      // 立即加载新 group
      this.refreshData();
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}

export default StockTableV2
