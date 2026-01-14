import React from 'react'

import './group_button.css'

class GroupButton extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      groups: this.props.data ? this.props.data: [],
    }
  }

  addGroup = () => {
    var group = prompt('请输入股票分组（分组名不超过4个汉字）')
    if(group == null) {return}
    
    group = group.trim()

    if (group.length > 0 && group.length < 5) {
      // 检测是否已存在
      if (this.state.groups.indexOf(group) != -1) {
        alert('已存在该分组！')
        return;
      }
      // 更新状态
      this.setState(prev => ({
        groups: [...prev.groups, group]
      }))
      // 父类操作
      this.props.onAddGroup && this.props.onAddGroup(group);
    } else if (group.length > 4) {
      alert('分组名必须在4个字以内，且不能为空！')
    }
  }

  removeGroup = (groupName) => {
    this.setState(prev => ({
      groups: prev.groups.filter(g => g !== groupName)
    }))
    // 父调用
    this.props.onRemoveGroup && this.props.onRemoveGroup(groupName);
  }

  changeOption = (groupName) => {
    // console.log(groupName)
    if (groupName == this.state.select) {
      return;
    }
    // 父调用
    this.props.onChangeGroup && this.props.onChangeGroup(groupName)
  }


  render() {
    const { groups } = this.state;
    const select = this.props.select;
    return (
      <div className="group">
        {groups.map((name, idx) => (
          <span key={idx} className={`tag tag-option ${select === name ? 'tag-select' : ''}`} onClick={() => this.changeOption(name)}>
            {name}
            <i
              className="tag-remove"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                this.removeGroup(name);
              }}
            >
              ×
            </i>
          </span>
        ))}
        <span className="tag tag-add" onClick={this.addGroup}>添加分组</span>
      </div>
    )
  }
}

export default GroupButton
