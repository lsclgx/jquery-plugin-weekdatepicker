/*!
 * jQuery lightweight plugin weekpicker2，每个月都显示5个周
 * Original author: @lsc
 * 2023-12-29
 */

;(function ( $, window, document, undefined ) {

  var pluginName = "weekpicker2"
  var defaults = {
    statement: ''
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

    this.selectedMonthIdx = ''
    this.selectedWeekIdx = ''
    this.selectedMonthName = ''
    this.selectedWeekName = ''

    this.map = {1: '一月', 2: '二月', 3: '三月', 4: '四月', 5: '五月', 6: '六月', 7: '七月', 8: '八月', 9: '九月', 10: '十月', 11: '十一月', 12: '十二月'}
    /**
     * 创建面板
     * @param {*} defaultDate 
     */
    this.createPanel = (defaultDate) => {
      const _this = this
      // 创建基础模板
      let monthStr = ''
      for(let i = 1; i <= 12; i ++) {
        monthStr += '<div id="month-cell_'+i+'" class="my-month-week" data-month-idx="'+i+'" data-month-name="'+this.map[i]+'" style="width:50px;height:50px;line-height:50px;text-align:center;font-size:13px;cursor:pointer;position:relative;" >'+this.map[i]+'</div>'
      }
      const str = '<div class="my-weekpicker-20240108" style="width: 215px;position:relative;padding:4px;border:1px solid rgba(0, 2, 1, 0.2);border-radius:4px!important;background: #fcfcfc;">' +
      '<div style="width:12px;height:12px;transform:rotate(45deg);border-left:1px solid #999;border-top:1px solid #999;position:absolute;top:-7.4px;left:10px;background:#fff;"></div>' +
      '    <div class="my-weekpicker-header" style="display: flex;justify-content:center;align-items:center;padding: 8px 0;">' +
      '      <span id="my-weekpicker-title" style="font-weight: bold;">'+ defaultDate +'</span>' +
      '    </div>' +
      '    <div class="my-weekpicker-main" style="display:flex;flex-wrap:wrap;justify-content:flex-start;align-items:center;">' +
      monthStr +
      '    </div>' +
      ' </div>'
      $('body').append(str)
      $('.my-weekpicker-20240108').css({
        'position': 'fixed',
        'top': this.top + this.height + 13 + 'px',
        'left': this.left + 'px'
      })
      $('.my-month-week').each((index, item) => {
        $(item).click(function() {
          _this.selectedMonthIdx = $(this).attr('data-month-idx')
          _this.selectedMonthName = $(this).attr('data-month-name')
          let html = '<div class="my-week-box" style="width:100%;"><p id="my-week-cell_1" class="my-week-cell" data-week-idx="1">第1周</p><p id="my-week-cell_2" class="my-week-cell" data-week-idx="2">第2周</p><p id="my-week-cell_3" class="my-week-cell" data-week-idx="3">第3周</p><p id="my-week-cell_4" class="my-week-cell" data-week-idx="4">第4周</p><p id="my-week-cell_5" class="my-week-cell" data-week-idx="5">第5周</p></div>'
          $('.my-weekpicker-main').html(html)
          if(defaultDate && _this.selectedMonthIdx==defaultDate.split('-')[0]) {
            const w = defaultDate.split('-')[1]
            _this.setValue('my-week-cell_' + w)
          }
          $('.my-week-cell').each((index1, item1) => {
            $(item1).click(function() {
              _this.selectedWeekIdx = $(this).attr('data-week-idx')
              _this.selectedWeekName = $(this).html()
              _this.$el.val(_this.selectedMonthName + _this.selectedWeekName)
              _this.$el.attr('data-statement', _this.selectedMonthIdx + '-' + _this.selectedWeekIdx)
              _this.$el.trigger('click')
            })
          })
        })
      })
      if(defaultDate) {
        this.setTitle(defaultDate)
        const m = defaultDate.split('-')[0]
        this.setValue('month-cell_' + m, defaultDate)
      }
    }

    /**
     * 设置面板显示标题，eg: 2023-12
     * @param {} title 
     */
    this.setTitle = (title) => {
      $('#my-weekpicker-title').html(title)
    }

    /**
     * 设置选中的周到目标元素input
     * @param {*} id 
     */
    this.setValue = (id) => {
      console.log(id);
      // 样式
      $('#'+id).css({
        'background': '#039',
        'background-image': 'linear-gradient(to bottom,#08c,#04c)',
        'background-repeat': 'repeat-x',
        'color': '#fff'
      })
      $('#'+id).find('td').css('color', '#fff')
      // 值
      const statement = this.options.statement
      if(statement) {
        const month = statement.split('-')[0]
        const week = statement.split('-')[1]
        this.$el.val(this.map[month] + '第' + week + '周')
        this.$el.attr('data-statement', statement)
      }
    }

    this.init()
  }

  Plugin.prototype.init = function () {
    const _this = this
    const statement = this.options.statement
    if(statement) {
      const month = statement.split('-')[0]
      const week = statement.split('-')[1]
      this.$el.val(this.map[month] + '第' + week + '周')
      this.$el.attr('data-statement', statement)
    }
    this.$el.click(function() {
      if($('body').find('.my-weekpicker-20240108').length) {
        $('body').find('.my-weekpicker-20240108').remove()
      }else {
        const statement = _this.$el.attr('data-statement')
        const date = statement || ''
        _this.createPanel(date)
      }
    })
    document.addEventListener('click', (e) => {
      if(this.element.contains(e.target)) return
      let myWeekpicker = document.querySelector('.my-weekpicker-20240108');
      if (myWeekpicker && !$(e.target).hasClass('my-month-week') && !myWeekpicker.contains(e.target)) {
        if($('body').find('.my-weekpicker-20240108').length) {
          $('body').find('.my-weekpicker-20240108').remove()
        }
      }
    }, false)
  }

  /**
   * 获取选中的值
   * @param {*} options 
   * @returns 
   */
  Plugin.prototype.getValue = function() {
    const obj = {
      value: this.$el.val(),
      statement: this.$el.attr('data-statement'),
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
    this.$el.attr('data-statement', '')
  }

  $.fn[pluginName] = function ( options ) {
    if (typeof options === 'string') {
      var method = options
      var method_arguments = Array.prototype.slice.call(arguments, 1)
      if (/^(clear|getValue)$/.test(method)) {
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