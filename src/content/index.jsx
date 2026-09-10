import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'

import GroupButton from '../component/group_button'
import StockTable from '../component/stock_table'
import Currency from '../component/currency.jsx'
import * as local from '../utils/local_db'
import * as xueqiu from '../utils/xueqiu'
import {group_key, stock_data_key} from '../utils/local_db_key.js'

import './index.css'

/* 分组按钮的事件管理 */

/* 主要页面的编辑 */
class App extends React.Component {
  constructor(props) {
    super(props)
    const groups = local.list_get(group_key);
    this.state = {
      group: groups.length>0? groups[0]: null,
      open: false,
      update: 0
    }
    this.addGroup = this.addGroup.bind(this);
    this.changeGroup = this.changeGroup.bind(this);
    this.addStock = this.addStock.bind(this);
    this.removeGroup = this.removeGroup.bind(this);
  }

  setOpen(v) {
    this.setState({open: v});
  }

  addGroup(group) {
    const flag = local.list_add(group_key, group);
    if(flag) {
      this.setState({group: group});
    }
  }
  removeGroup(group) {
    local.list_a_del(group_key, group);
    // map清理
    local.map_a_del(stock_data_key, group);
    // 刷新表
    if(group == this.state.group) {
      const groups = local.list_get(group_key);
      this.setState({group: groups.length>0? groups[0]: null})
    }
  }
  changeGroup(group) {
    this.setState({group: group});
  }

  addStock() {
      var code = prompt('请输入股票代码(如000001, 0688）')
      if(code == null) {return}
      
      code = code.trim().toUpperCase();

      if(code.length > 0){
        const rep = xueqiu.get_quote_data(code);
        const data= rep.data.items[0];
        if(data.quote == null) {
          alert(code+'标的不存在！');
          return;
        }
        // 加入local
        const group = this.state.group;
        var stocks = local.map_a_get(stock_data_key, group, {});
        stocks[code] = data;
        local.map_a_set(stock_data_key, group, stocks);
        // 更新表格
        this.setState({update: this.state.update+1})
      }
  }

  addDefault(k) {
    const data = {
      'bank': ['601988','03988','601288','01288','601398','01398','00939','601939','601658','01658','600036','000001','601328','03328'],
      'insurance':['601318', '02318', '601319', '01339', '02628', '601628', '00966', '601319', '01339'],
      'oil': ['600028', '00386', '601857', '00857', '600938', '00883']
    }
    const codes = data[k];
    if(codes.length > 0) {
      const rep = xueqiu.get_quote_data(codes);
      const items= rep.data.items;
      // 加入local
        const group = this.state.group;
        var stocks = local.map_a_get(stock_data_key, group, {});
        for(var item of items) {
          if(item.quote == null) {
            continue;
          }
          const code = item.quote.code.toUpperCase();
          stocks[code] = item;
        }
        local.map_a_set(stock_data_key, group, stocks);
        // 更新表格
        this.setState({update: this.state.update+1})
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
              <button onClick={()=>this.addDefault('bank')}>导入大行</button>
              <button onClick={()=>this.addDefault('insurance')}>导入保险</button>
              <button onClick={()=>this.addDefault('oil')}>导入石油</button>
            </div>
            <div className="view">
              <StockTable group={this.state.group} update={this.state.update}/>
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
// console.log('雪球网页加载完成')
// chrome.runtime.sendMessage(
//   {
//     type: 'hello'
//   },
//   (response) => {
//     console.log('Background 返回：', response)
//   }
// )