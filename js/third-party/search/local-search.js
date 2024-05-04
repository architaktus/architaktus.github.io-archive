/* global CONFIG, pjax, LocalSearch */

document.addEventListener('DOMContentLoaded', () => {
  if (!CONFIG.path) {
    // Search DB path
    console.warn('`hexo-generator-searchdb` plugin is not installed!');
    return;
  }

  //LocalSearch class来自于 hexo-generator-searchdb/dist/search.js
  const localSearch = new LocalSearch({
    path             : CONFIG.path,
    top_n_per_article: CONFIG.localsearch.top_n_per_article,
    unescape         : CONFIG.localsearch.unescape
  });

  const input = document.querySelector('.search-input');

  let resultItems = [];
  const container = document.querySelector('.search-result-container');
  //Logo TODO 替换logo
    const StateStandBy = null;//'<div class="search-result-icon"><i class="fa fa-spinner fa-pulse fa-2x"></i></i></div>'; 
      //'<div class="search-result-icon"><i class="fa fa-search fa-5x"></i></div>'; 
    const StateNoResult = '<div class="search-result-icon"><i class="far fa-frown fa-5x"></i></div>';
  //input输入和结果显示的耦合函数
  const inputEventFunction = () => {
    if (!localSearch.isfetched) return;
    const searchText = input.value.trim().toLowerCase();
    const keywords = searchText.split(/[-\s]+/);
    if (searchText.length > 0) {
      // Perform local searching
      resultItems = localSearch.getResultItems(keywords);
    }
    //console.log('keywords = ' + keywords);
    //console.log('trigger = ' + CONFIG.localsearch.trigger);
    //console.log('top_n_per_article = ' + CONFIG.localsearch.top_n_per_article);
    if (keywords.length === 1 && keywords[0] === '') {
      container.classList.add('no-result');
      container.innerHTML = StateStandBy;
    } else if (resultItems.length === 0) {
      container.classList.add('no-result');
      container.innerHTML = StateNoResult;
    } else {
      resultItems.sort((left, right) => {
        if (left.includedCount !== right.includedCount) {
          return right.includedCount - left.includedCount;
        } else if (left.hitCount !== right.hitCount) {
          return right.hitCount - left.hitCount;
        }
        return right.id - left.id;
      });
      const stats = CONFIG.i18n.hits.replace('${hits}', resultItems.length);

      container.classList.remove('no-result');
      container.innerHTML = `<div class="search-stats">${stats}</div>
        <hr>
        <ul class="search-result-list">${resultItems.map(result => result.item).join('')}</ul>`;
      if (typeof pjax === 'object') pjax.refresh(container);
    }
  };

  localSearch.highlightSearchWords(document.querySelector('.post-body'));
  if (CONFIG.localsearch.preload) {
    localSearch.fetchData();
  }

  //不同的输入模式，见_config.yml
  if (CONFIG.localsearch.trigger === 'auto') {
    input.addEventListener('input', inputEventFunction);
  } else {
    document.querySelector('.search-icon').addEventListener('click', inputEventFunction);
    input.addEventListener('keypress', event => {
      if (event.key === 'Enter') {
        inputEventFunction();
      }
    });
  }
  window.addEventListener('search:loaded', inputEventFunction);

  // Handle and trigger popup window
  document.querySelectorAll('.popup-trigger').forEach(element => {
    element.addEventListener('click', () => {
      document.body.classList.add('search-active');
      // Wait for search-popup animation to complete
      setTimeout(() => input.focus(), 500);
      if (!localSearch.isfetched) localSearch.fetchData();
    });
  });

  /* 
  // 关闭函数
  const onPopupClose = () => {
    //document.body.classList.remove('search-active');
    const searchBox = document.querySelector('.sidebar-menu__item-child.search-wrapper');
    if (!searchBox.classList.contains('non-visible')){
      searchBox.classList.add('non-visible');
    }
  };

  document.querySelector('.search-pop-overlay').addEventListener('click', event => {
    if (event.target === document.querySelector('.search-pop-overlay')) {
      onPopupClose();
    }
  }); */
  /* document.querySelector('.popup-btn-clear').addEventListener('click', event => {
    if (event.target.closest('.popup-btn-clear')) {
      onPopupClose();
      console.warn('close');
  }
  }); */

  //按搜索栏 ×， 清除内容
  document.querySelector('.popup-btn-clear').addEventListener('click', event => {
    input.value = null;
    resultItems = [];
    container.classList.add('no-result');
    container.innerHTML = StateStandBy;
  }); 
  
  /*
  在总控muse.js(现motion/sidebar-listener)中已设置
  //按ESC 关闭
  window.addEventListener('keyup', event => {
    if (event.key === 'Escape') {
      onPopupClose();
    }
  });*/
 
  /* TODO 是什么
  document.addEventListener('pjax:success', () => {
    localSearch.highlightSearchWords(document.querySelector('.post-body'));
    onPopupClose();
  }); */
});
