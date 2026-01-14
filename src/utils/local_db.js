/*一般数值的管理*/
export function val_set(key, val) {
  localStorage.setItem(key, val);
}

export function val_get(key, default_val=null) {
  const v = localStorage.getItem(key);
  return v ? v: default_val;
}

export function val_del(key) {
  localStorage.removeItem(key)
}


/*列表的管理*/
export function list_get(key, default_val=[]) {
    var buf = localStorage.getItem(key);
    return buf? JSON.parse(buf): default_val;
}

export function list_add(key, v, keep_unique=true, not_null=true) {
    if(v == null && not_null) {
      console.log('添加到list的元素不能为null,不执行任何操作!')
      return;
    }

    var values = list_get(key);

    // 存在性检测
    if(keep_unique && values.indexOf(v) >= 0) {
      console.warn('在localDB [key={group}]，已存在{code}'.replace('{group}', key).replace('{code}', v));
      return;
    }

    values.push(v);
    localStorage.setItem(key, JSON.stringify(values));
    return true;
}

export function list_a_del(key, v) {
    var values = list_get(key);
    const i = values.indexOf(v);
    console.log(values, i, v)
    if(i>=0){
      values.splice(i, 1);
      localStorage.setItem(key, JSON.stringify(values));
    } else{
      console.warn('在localDB [key={group}]，已删除{code}'.replace('{group}', key).replace('{code}', v));
    }
}

export function list_del(key) {
  localStorage.removeItem(key)
}

/* 字典的管理 */
export function map_get(key, default_val={}) {
    var buf = localStorage.getItem(key);
    return buf? JSON.parse(buf): default_val;
}

export function map_set(key, v) {
  val_set(key, v);
}

export function map_a_get(key, sub_key, default_val=null) {
    var vals = map_get(key);
    if(sub_key in vals) {
      return vals[sub_key];
    }

    return default_val;
}

export function map_a_set(key, sub_key, v) {
    var vals = map_get(key);
    vals[sub_key] = v;
    localStorage.setItem(key, JSON.stringify(vals));
}

export function map_a_del(key, sub_key) {
    var vals = map_get(key);
    delete vals[sub_key];
    localStorage.setItem(key, JSON.stringify(vals));
}

export function map_del(key) {
  localStorage.removeItem(key)
}
