import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'

import GroupButton from '../component/group_button'
import StockTable from '../component/stock_table';
import StockTableV2 from '../component/stock_table_v2.jsx'
import Currency from '../component/currency.jsx'
import * as local from '../utils/local_db'
import * as xueqiu from '../utils/xueqiu'
import { group_key, xueqiu_stock_codes_key } from '../utils/local_db_key.js'

import './index.css'

/* 分组按钮的事件管理 */

/* 主要页面的编辑 */
class App extends React.Component {
  constructor(props) {
    super(props)
    const groups = local.list_get(group_key);
    this.state = {
      group: groups.length > 0 ? groups[0] : null,
      open: false,
      update: 0
    }
    this.addGroup = this.addGroup.bind(this);
    this.changeGroup = this.changeGroup.bind(this);
    this.addStock = this.addStock.bind(this);
    this.removeGroup = this.removeGroup.bind(this);
  }

  setOpen(v) {
    this.setState({ open: v });
  }

  addGroup(group) {
    const flag = local.list_add(group_key, group);
    if (flag) {
      this.setState({ group: group });
    }
  }
  removeGroup(group) {
    local.list_a_del(group_key, group);
    // map清理
    local.map_a_del(xueqiu_stock_codes_key, group);
    // 刷新表
    if (group == this.state.group) {
      const groups = local.list_get(group_key);
      this.setState({ group: groups.length > 0 ? groups[0] : null })
    }
  }
  changeGroup(group) {
    this.setState({ group: group });
  }

  addStock() {
    if (!this.state.group) {
      alert('请先添加分组！');
      return;
    }

    var val = prompt('请输入股票代码(如000001, 0688）')
    if (val == null || val.trim().length == 0) { return }

    val = val.trim().toUpperCase();
    var codes = val.split(',').map(r=>r.trim());

    var success_codes  = [], error_codes = [];
    codes.forEach((code, index) => {
      // console.log(index, item);
      if (code.length > 0) {
        const rep = xueqiu.get_quote_data(code);
        const data = rep.data.items[0];
        if (data.quote == null) {
          error_codes.push(code);
          return;
        }
        // 加入local
        const group = this.state.group;
        var stocks = local.map_a_get(xueqiu_stock_codes_key, group, []);
  
        // code不存在
        if (stocks.indexOf(code) == -1) {
          stocks.push(code);
          local.map_a_set(xueqiu_stock_codes_key, group, stocks);
        }
        success_codes.push(code);
      }
    });
    // 更新表格
    if(success_codes.length > 0) {
      this.setState({ update: this.state.update + 1 });
    }
    
    // 错误提示
    if(error_codes.length > 0) {
      const err = error_codes.join(',') + '代码无法添加，请检测代码或联系管理员！'
      alert(err);
    }
  }

  addDefault(k) {
    if (!this.state.group) {
      alert('请先添加分组！');
      return;
    }

    const data = {
      'bank': ['601988', '03988', '601288', '01288', '601398', '01398', '00939', '601939', '601658', '01658', '600036', '000001', '601328', '03328'],
      'insurance': ['601318', '02318', '601319', '01339', '02628', '601628', '00966', '601319', '01339'],
      'oil': ['600028', '00386', '601857', '00857', '600938', '00883']
    }
    const codes = data[k];
    if (codes.length > 0) {
      const rep = xueqiu.get_quote_data(codes);
      const items = rep.data.items;
      // 加入local
      const group = this.state.group;
      var stocks = local.map_a_get(xueqiu_stock_codes_key, group, {});
      for (var item of items) {
        if (item.quote == null) {
          continue;
        }
        const code = item.quote.code.toUpperCase();
        stocks[code] = item;
      }

      var stocks = local.map_a_get(xueqiu_stock_codes_key, group, []);
      stocks = stocks.concat(codes);
      stocks = [...new Set(stocks)]
      local.map_a_set(xueqiu_stock_codes_key, group, stocks);
      // 更新表格
      this.setState({ update: this.state.update + 1 })
    }
  }

  render() {
    const groups = local.list_get(group_key);
    const open = this.state.open;
    return (
      <div>
        {open && (
          <div className="panel">
            <Currency title='HKD/CNY' code='HKDCNY.FX' />
            <div className="divider"></div>
            <GroupButton
              data={groups}
              select={this.state.group}
              onAddGroup={this.addGroup}
              onRemoveGroup={this.removeGroup}
              onChangeGroup={this.changeGroup}
            />
            <div className="divider"></div>
            <div className="ctl">
              <button onClick={this.addStock}>新增股票</button>
              <button onClick={() => this.addDefault('bank')}>导入大行</button>
              <button onClick={() => this.addDefault('insurance')}>导入保险</button>
              <button onClick={() => this.addDefault('oil')}>导入石油</button>
            </div>
            <div className="view">
              <StockTableV2 group={this.state.group} updaet={this.state.update}/>
            </div>
          </div>
        )}
        <div
          className={`side-toggle ${open ? 'open' : ''}`}
          onClick={() => this.setOpen(!open)}
        >
          <span className="arrow" />
        </div>
      </div>
    )
  }
}

const root = document.createElement('div')
root.id = 'xueqiu-panel'
document.body.appendChild(root)

createRoot(root).render(<App />)