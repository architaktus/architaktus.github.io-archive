/* global CONFIG */

/** Sidebar相关监听器 */
/** 通过layout\_scripts\index.njk引用 */

document.addEventListener('DOMContentLoaded', () => {

  const isRight = CONFIG.sidebar.position === 'right';

  const listenerMotion = {
    mouse: {},
    init : function() {
      //下述为监听器

      window.addEventListener('mousedown', this.mousedownHandler.bind(this));
      window.addEventListener('mouseup', this.mouseupHandler.bind(this));

      //the half-ton layer on content when sidebar open, click to close sidebar //('.sidebar-dimmer')
      const dimmer = document.querySelector('.sidebar-dimmer');
      dimmer.addEventListener('click', this.toggleSidebarOnClick.bind(this));
      dimmer.addEventListener('wheel', function(event){
        if(document.body.classList.contains('sidebar-active')) {
            event.preventDefault(); // 阻止滚动
        }
      }, {passive: false});

      //click on sidebar where no content, close sidebar
      /*TODO
      const sidebar = document.querySelector('aside');
      sidebar.addEventListener('click', function(event){
        this.toggleSidebarOnClick();
        event.stopPropagation();
      }.bind(sidebar));
      sidebar.addEventListener('wheel', function(event){
        event.stopPropagation(); // 阻止滚动事件冒泡
        //console.log('阻止冒泡')
      }, {passive: false});
      */
      
      
      //右上角悬浮按钮 sidebar-toogle button
      document.querySelector('.sidebar-toggle').addEventListener('click', this.toggleSidebarOnClick.bind(this));
      window.addEventListener('sidebar:show', this.showSidebar);
      window.addEventListener('sidebar:hide', this.hideSidebar);
      
      //点击含下拉菜单者
      document.querySelectorAll('.sidebar-menu__item.has-child').forEach(item => {
        const trigger = item.querySelector('.sidebar-menu__item-button');
        //const submenu = item.querySelector('.sidebar-menu__item-child');
        trigger.addEventListener('click', function(event){
          event.preventDefault();
          event.stopPropagation();
          item.classList.toggle('child-visible');
          this.toggleMenuItemOnClick.call(event.target, event);
        });
      });

      //按ESC 关闭
      window.addEventListener('keyup', event => {
        if (event.key === 'Escape') {
          document.querySelectorAll('.sidebar-menu__item.has-child').forEach(item=>{
            if (item.classList.contains('child-visible')){
              item.classList.remove('child-visible');
            }
          });
        }
      });

      //子菜单按三角形 关闭
      document.querySelectorAll('.popup-btn-close').forEach(item => {
        item.addEventListener('click', event => {
          const subMenuItem = event.target.closest('.sidebar-menu__item');
          if (subMenuItem.classList.contains('child-visible')){
            subMenuItem.classList.remove('child-visible');
          }
        });
      });
    },

    //上述监听器所用到的各函数
    mousedownHandler: function(event) {
      this.mouse.X = event.pageX;
      this.mouse.Y = event.pageY;
    },
    mouseupHandler: function(event) {
      const deltaX = event.pageX - this.mouse.X;
      const deltaY = event.pageY - this.mouse.Y;
      const clickingBlankPart = Math.hypot(deltaX, deltaY) < 20 && event.target.matches('.main');
      // Fancybox has z-index property, but medium-zoom does not, so the sidebar will overlay the zoomed image.
      if (clickingBlankPart || event.target.matches('img.medium-zoom-image')) {
        this.hideSidebar();
      }
    },
    //悬浮按钮toggle
    toggleSidebarOnClick: function() {
      document.body.classList.contains('sidebar-active') ? this.hideSidebar() : this.showSidebar();
    },
    showSidebar: function() {
      document.body.classList.add('sidebar-active');
      document.body.classList.add('no-scroll');
      const animateAction = isRight ? 'fadeInRight' : 'fadeInLeft';
      document.querySelectorAll('.sidebar .animated').forEach((element, index) => {
        element.style.animationDelay = (100 * index) + 'ms';
        element.classList.remove(animateAction);
        setTimeout(() => {
          // Trigger a DOM reflow
          element.classList.add(animateAction);
        });
      });
    },
    hideSidebar: function() {
      document.body.classList.remove('sidebar-active');
      document.body.classList.remove('no-scroll');
    }
  };




  //激活listeners
  if (CONFIG.sidebar.display !== 'remove') listenerMotion.init();

  function updateFooterPosition() {
    const footer = document.querySelector('.footer');
    const containerHeight = document.querySelector('.main').offsetHeight + footer.offsetHeight;
    footer.classList.toggle('footer-fixed', containerHeight <= window.innerHeight);
  }

  updateFooterPosition();
  window.addEventListener('resize', updateFooterPosition);
  window.addEventListener('scroll', updateFooterPosition, { passive: true });
});
