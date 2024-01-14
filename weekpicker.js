/*!
 * jQuery lightweight plugin weekpicker
 * Original author: @lsc
 * 2023-12-29
 */

;(function ( $, window, document, undefined ) {

  var pluginName = "weekpicker"
  var defaults = {
    start_date: '',
    end_date: ''
  }

  function Plugin( element, options ) {
    this.element = element
    this.$el = $(element)

    this.options = $.extend( {}, defaults, options)

    this._defaults = defaults
    this._name = pluginName

    this.left = this.$el.offset().left
    this.top = this.$el.offset().top
    this.height = this.$el.height()
    /**
     * 创建面板
     * @param {*} defaultDate 
     */
    this.createPanel = (defaultDate) => {
      const _this = this
      // 创建基础模板
      const str = '<div class="my-weekpicker-20231228" style="width: 300px;position:relative;padding:5px;border: 1px solid #999;border-radius:4px!important;background: #fff;">' +
      '<div style="width:12px;height:12px;transform:rotate(45deg);border-left:1px solid #999;border-top:1px solid #999;position:absolute;top:-7.4px;left:10px;background:#fff;"></div>' +
      '    <div class="my-weekpicker-header" style="display: flex;justify-content:space-between;align-items:center;padding: 8px 0;">' +
      '      <span>' +
      '        <button id="setLastYear" style="font-weight: bold;width:30px;height:30px;"> << </button>' +
      '        <button id="setLastMonth" style="font-weight: bold;width:30px;height:30px;"> < </button>' +
      '      </span>' +
      '      <span id="my-weekpicker-title" style="font-weight: bold;">'+ defaultDate +'</span>' +
      '      <span>' +
      '        <button id="setNextMonth" style="font-weight: bold;width:30px;height:30px;"> > </button>' +
      '        <button id="setNextYear" style="font-weight: bold;width:30px;height:30px;"> >> </button>' +
      '      </span>' +
      '    </div>' +
      '    <div class="my-weekpicker-main">' +
      '      <table border="0" style="width: 100%;border-collapse:collapse;">' +
      '        <thead>' +
      '          <th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th><th>日</th>' +
      '        </thead>' +
      '        <tbody>' +
      '        </tbody>' +
      '      </table>' +
      '    </div>' +
      ' </div>'
      $('body').append(str)
      $('.my-weekpicker-20231228').css({
        'position': 'fixed',
        'top': this.top + this.height + 13 + 'px',
        'left': this.left + 'px'
      })

      // 给基础模板已有元素添加点击事件
      $('#setLastYear').click(function() {
        const date = $('#my-weekpicker-title').html()
        const title = _this.getLastYear(date)
        _this.setTitle(title)
        _this.setDays(title)
      })
      $('#setLastMonth').click(function() {
        const date = $('#my-weekpicker-title').html()
        const title = _this.getLastMonth(date)
        _this.setTitle(title)
        _this.setDays(title)
      })
      $('#setNextMonth').click(function() {
        const date = $('#my-weekpicker-title').html()
        const title = _this.getNextMonth(date)
        _this.setTitle(title)
        _this.setDays(title)
      })
      $('#setNextYear').click(function() {
        const date = $('#my-weekpicker-title').html()
        const title = _this.getNextYear(date)
        _this.setTitle(title)
        _this.setDays(title)
      })

      // 创建空日期表格，并给周（tr）添加点击事件
      let str1 = ''
      for(let i = 1; i <= 6; i++) {
        let str2 = ''
        for(let j = 1; j <= 7; j++) {
          str2 += '<td style="width:20px;height:20px;padding:9px 4px;text-align:center;cursor:pointer;" id="td_'+(7*(i-1) +j)+'">-</td>'
        }
        str1 += '<tr style="border-radius:4px;" id="tr_'+i+'">'+ str2 +'</tr>'
      }
      $('.my-weekpicker-main').find('tbody').html(str1)
      $('.my-weekpicker-main').find('tbody').find('tr').each((index, item) => {
        $(item).find('td:nth-of-type(1)').css({
          'border-top-left-radius': '4px',
          'border-bottom-left-radius': '4px',
        })
        $(item).find('td:nth-of-type(7)').css({
          'border-top-right-radius': '4px',
          'border-bottom-right-radius': '4px',
        })
        $(item).click(function() {
          const id = $(item).attr('id')
          const date = $('#my-weekpicker-title').html()
          let start = ''
          let end = ''
          const sTd = $(item).find('td:nth-of-type(1)')
          const eTd = $(item).find('td:last-child')
          if(sTd.find('span').length && eTd.find('span').length) {
            start = _this.getNextMonth(date) + '-' + _this.addZero(sTd.find('span').html())
            end = _this.getNextMonth(date) + '-' + _this.addZero(eTd.find('span').html())
          } else {
            if(sTd.find('span').length) {
              start = _this.getLastMonth(date) + '-' + _this.addZero(sTd.find('span').html())
            }else {
              start = _this.addZero(date) + '-' + _this.addZero(sTd.html())
            }
            if(eTd.find('span').length) {
              end = _this.getNextMonth(date) + '-' + _this.addZero(eTd.find('span').html())
            }else {
              end = _this.addZero(date) + '-' + _this.addZero(eTd.html())
            }
          }
          _this.setValue(id, start, end)
        })
      })

      // 根据面板当前显示日期，为空日期表格填充日期
      this.setDays(defaultDate)
    }

    // 获取每月多少天
    this.getDays = (year) => {
      // 能够被4整除且不能整除100的为闰年
      const daysMap = {
        1: 31,
        2: (year%4===0 && year%100!==0) ? 29 : 28,
        3: 31,
        4: 30,
        5: 31,
        6: 30,
        7: 31,
        8: 31,
        9: 30,
        10: 31,
        11: 30,
        12: 31
      }
      return daysMap
    }

    /**
     * 填充日期
     * @param {面板当前显示日期} date 
     */
    this.setDays = (date) => {
      const weekMap = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 0: 7 }
      const year = Number(date.split('-')[0])
      const month = Number(date.split('-')[1])
      const daysOfCurrentMonth = this.getDays(year)[month]
      const weekDayOfFirst = weekMap[new Date(year+'/'+month+'/'+'01').getDay()]
      const showLastMonth = weekDayOfFirst - 1
      const lastMonth = this.getLastMonth(date)
      const nextMonth = this.getNextMonth(date)
      const daysOfLastMonth = this.getDays(lastMonth.split('-')[0])[Number(lastMonth.split('-')[1])]
      for(let i = 1; i <= showLastMonth; i++) {
        const day = daysOfLastMonth-showLastMonth+i
        $('#td_' + i).html('<span style="color:#999;">'+day+'</span>')
        $('#td_' + i).attr('data-date', lastMonth+'-'+this.addZero(day))
      }
      for(let i = 0; i < daysOfCurrentMonth; i++) {
        const day = i+1
        $('#td_' + (weekDayOfFirst + i)).html(day)
        $('#td_' + (weekDayOfFirst + i)).attr('data-date', year+'-'+this.addZero(month)+'-'+this.addZero(day))
      }
      for(let i = showLastMonth + daysOfCurrentMonth + 1; i <= 42; i++) {
        const day = i - (showLastMonth + daysOfCurrentMonth)
        $('#td_' + i).html('<span style="color:#999;">'+day+'</span>')
        $('#td_' + i).attr('data-date', nextMonth+'-'+this.addZero(day))
      }

      const start = this.$el.attr('data-start')
      if(!start) return
      const end = this.$el.attr('data-end')
      let trId = ''
      $('.my-weekpicker-main').find('td').each((index, item) => {
        if($(item).attr('data-date') === start) trId = $(item).parent().attr('id')
      })
      this.setValue(trId, start, end)
    }

    this.getLastYear = (date) => {
      const year = Number(date.split('-')[0])
      const month = Number(date.split('-')[1])
      const res = (year-1) + '-' + month
      return this.addZero(res)
    }

    this.getNextYear = (date) => {
      const year = Number(date.split('-')[0])
      const month = Number(date.split('-')[1])
      const res = (year+1) + '-' + month
      return this.addZero(res)
    }

    this.getLastMonth = (date) => {
      const year = Number(date.split('-')[0])
      const month = Number(date.split('-')[1])
      let res = ''
      if(month === 1) {
        res = (year-1) + '-12'
      }else {
        res = year + '-' + (month-1)
      }
      return this.addZero(res)
    }
  
    this.getNextMonth = (date) => {
      const year = Number(date.split('-')[0])
      const month = Number(date.split('-')[1])
      let res = ''
      if(month === 12) {
        res = (year+1) + '-01'
      }else {
        res = year + '-' + (month+1)
      }
      return this.addZero(res)
    }

    /**
     * 设置面板显示标题，eg: 2023-12
     * @param {} title 
     */
    this.setTitle = (title) => {
      $('#my-weekpicker-title').html(title)
    }

    /**
     * 设置选中的周的日期到目标元素input
     * @param {*} start 
     * @param {*} end 
     */
    this.setValue = (id, start, end) => {
      console.log(id, start, end);
      // 样式
      $('.my-weekpicker-main').find('tbody').find('tr').css('background', '#fff')
      $('.my-weekpicker-main').find('tbody').find('tr').find('td').css('color', '#000')
      if(!id) return
      $('#'+id).css({
        'background': '#039',
        'background-image': 'linear-gradient(to bottom,#08c,#04c)',
        'background-repeat': 'repeat-x'
      })
      $('#'+id).find('td').css('color', '#fff')
      // 值
      const year = new Date(start).getFullYear()
      const week = this.getYearWeek(new Date(start)) || start + ' 至 ' + end
      this.$el.val(year + '年第' + week + '周')
      this.$el.attr('data-start', start)
      this.$el.attr('data-end', end)
    }

    /**
     * 补0
     */
    this.addZero = (date) => {
      if(!date) return date
      if(date.length > 2) {
        let str = ''
        let year = Number(date.split('-')[0])
        let month = Number(date.split('-')[1])
        month = month>9 ? month : '0'+month
        let day = date.split('-')[2] ? Number(date.split('-')[2]) : ''
        day = day ? (day>9 ? day : '0'+day) : ''
        str = day ? year + '-' + month + '-' +day : year + '-' + month
        return str
      }else {
        let str = Number(date)>9 ? Number(date) : '0'+Number(date)
        return str
      }
    }

    this.init()
  }

  Plugin.prototype.init = function () {
    const _this = this
    const os = this.addZero(this.options.start_date)
    const oe = this.addZero(this.options.end_date)
    if(os) {
      const year = new Date(os).getFullYear()
      const week = this.getYearWeek(new Date(os)) || os + ' 至 ' + oe
      this.$el.val(year + '年第' + week + '周')
      this.$el.attr('data-start', os)
      this.$el.attr('data-end', oe)
    }
    this.$el.click(function() {
      if($('body').find('.my-weekpicker-20231228').length) {
        $('body').find('.my-weekpicker-20231228').remove()
      }else {
        const start = _this.$el.attr('data-start')
        const today = new Date().getFullYear() + '-' + _this.addZero((new Date().getMonth()+1))
        const date = start ? start.split('-')[0] + '-' + start.split('-')[1] : today
        _this.createPanel(date)
      }
    })
    document.addEventListener('click', (e) => {
      if(this.element.contains(e.target)) return
      let myWeekpicker = document.querySelector('.my-weekpicker-20231228');
      if (myWeekpicker && !myWeekpicker.contains(e.target)) {
        if($('body').find('.my-weekpicker-20231228').length) {
          $('body').find('.my-weekpicker-20231228').remove()
        }
      }
    }, false)
  }

  /**
   * 返回日期是一年内的第几周，可供外部调用
   * @param {*} date 日期
   * @returns 
   */
  Plugin.prototype.getYearWeek = function(date) {
    //本年的第一天
    var beginDate = new Date(date.getFullYear(), 0, 1);
    //星期从0-6,0代表星期天，6代表星期六
    var endWeek = date.getDay();
    if (endWeek == 0) endWeek = 7;
    var beginWeek = beginDate.getDay();
    if (beginWeek == 0) beginWeek = 7;
    //计算两个日期的天数差
    var millisDiff = date.getTime() - beginDate.getTime();
    var dayDiff = Math.floor(( millisDiff + (beginWeek - endWeek) * (24 * 60 * 60 * 1000)) / 86400000);
    return Math.ceil(dayDiff / 7) + 1;
  } 

  /**
   * 清空选中的值
   * @param {*} options 
   * @returns 
   */
  Plugin.prototype.getValue = function() {
    const obj = {
      value: this.$el.val(),
      start: this.$el.attr('data-start'),
      end: this.$el.attr('data-end')
    }
    return obj
  }

  /**
   * 清空选中的值
   * @param {*} options 
   * @returns 
   */
  Plugin.prototype.clear = function() {
    this.$el.val('')
    this.$el.attr('data-start', '')
    this.$el.attr('data-end', '')
  }

  $.fn[pluginName] = function ( options ) {
    if (typeof options === 'string') {
      var method = options
      var method_arguments = Array.prototype.slice.call(arguments, 1)
      if (/^(getYearWeek|clear|getValue)$/.test(method)) {
        var api = this.first().data("plugin_" + pluginName)
        if (api && typeof api[method] === 'function') {
            return api[method].apply(api, method_arguments)
        }
      }else {
        return false
      }
    }else {
      return this.each(function () {
        if ( !$.data(this, "plugin_" + pluginName )) {
          $.data( this, "plugin_" + pluginName,
          new Plugin( this, options ))
        }
      })
    }
  }

})( jQuery, window, document )